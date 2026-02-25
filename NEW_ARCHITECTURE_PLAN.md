# 🏗️ New Architecture Plan: Multi-Tenant B2B2C Platform

## ✅ Perfect Timing: Clean Rebuild

**Current Status:**
- ✅ No existing users = No migration risk
- ✅ Clean slate = Best architecture from day one
- ✅ Stronger business model = Better foundation

**Decision:**
- ✅ Use **Supabase** for: Auth, RLS, File Storage
- ✅ Keep **Prisma** for: Backend logic, complex queries, migrations
- ✅ Host on **Hetzner** (current setup)
- ✅ **Hybrid approach** = Best of both worlds

---

## 🎯 Architecture Overview

### Tech Stack:
```
Frontend: Next.js 14 (App Router)
Backend: Express.js + Prisma
Database: PostgreSQL (Hetzner)
Auth: Supabase Auth
RLS: Supabase Row-Level Security
Storage: Supabase Storage
Payments: Stripe + Paystack + Flutterwave
Email: Resend
```

### Data Flow:
```
User → Supabase Auth → JWT Token
JWT Token → Express Backend → Prisma Query
Prisma Query → PostgreSQL (with RLS context)
Supabase RLS → Enforces multi-tenant isolation
```

---

## 📊 Database Schema Design

### Core Models:

```prisma
// ============================================
// ORGANIZATION (Multi-Tenant Foundation)
// ============================================
model Organization {
  id                String   @id @default(uuid())
  name              String
  slug              String   @unique  // For white-label URLs
  subscriptionPlan  String   // 'starter', 'professional', 'enterprise'
  subscriptionStatus String  // 'active', 'inactive', 'cancelled'
  
  // Branding (white-label)
  branding          Json?    // { logo: string, primaryColor: string, customDomain: string }
  
  // Settings
  settings          Json?    // Feature flags, preferences
  
  // Timestamps
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  // Relations
  users             OrganizationUser[]
  cases             Case[]
  documents         Document[]  // Organization templates
  tasks             Task[]
  communications    Communication[]
  
  @@index([slug])
  @@map("organizations")
}

// ============================================
// USER (Supabase Auth + Our Metadata)
// ============================================
model User {
  id                String   @id @default(uuid())  // Supabase UUID
  email             String   @unique
  fullName          String?
  phone             String?
  avatarUrl         String?
  
  // Supabase auth metadata
  supabaseUserId    String   @unique  // Link to Supabase auth.users
  
  // Timestamps
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  // Relations
  organizationMemberships OrganizationUser[]
  casesAsApplicant  Case[] @relation("ApplicantCases")
  casesAsProfessional Case[] @relation("ProfessionalCases")
  documents         Document[]
  tasks             Task[]
  communications    Communication[]
  
  @@map("users")
}

// ============================================
// ORGANIZATION MEMBERSHIP (Role-Based Access)
// ============================================
model OrganizationUser {
  id             String   @id @default(uuid())
  organizationId String
  userId         String
  
  // Role: 'admin', 'professional', 'applicant'
  role           String
  
  // Invitation
  invitedBy      String?
  invitedAt      DateTime?
  joinedAt       DateTime @default(now())
  status         String   // 'pending', 'active', 'inactive'
  
  // Relations
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  user           User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([organizationId, userId])
  @@index([organizationId])
  @@index([userId])
  @@map("organization_users")
}

// ============================================
// CASE (Core Business Entity)
// ============================================
model Case {
  id             String   @id @default(uuid())
  organizationId String
  
  // Case identification
  caseNumber     String   @unique  // Auto-generated: ORG-YYYY-001
  title          String
  
  // People
  applicantId    String?  // Applicant user
  professionalId String?  // Assigned professional
  
  // Visa details
  visaType       String   // 'student', 'work', 'family', etc.
  country        String   // Destination country
  visaCategory   String?  // Specific category
  
  // Status & Priority
  status         String   // 'draft', 'in_progress', 'document_review', 'submitted', 'interview', 'approved', 'rejected', 'withdrawn'
  priority       String   // 'low', 'medium', 'high', 'urgent'
  
  // Dates
  applicationDeadline DateTime?
  submissionDate      DateTime?
  decisionDate        DateTime?
  
  // Metadata
  notes          String?  @db.Text
  tags           String[] // For filtering/searching
  
  // Timestamps
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  // Relations
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  applicant      User? @relation("ApplicantCases", fields: [applicantId], references: [id])
  professional   User? @relation("ProfessionalCases", fields: [professionalId], references: [id])
  documents      CaseDocument[]
  tasks          Task[]
  communications Communication[]
  checklists     CaseChecklist[]
  
  @@index([organizationId])
  @@index([applicantId])
  @@index([professionalId])
  @@index([status])
  @@index([caseNumber])
  @@map("cases")
}

// ============================================
// DOCUMENT (Linked to Cases)
// ============================================
model Document {
  id              String   @id @default(uuid())
  organizationId  String
  caseId          String?  // Link to case (if case-specific)
  
  // Document info
  type            String   // 'sop', 'cover_letter', 'support_letter', 'passport', 'transcript', etc.
  title           String
  category        String   // 'application', 'supporting', 'financial', 'educational'
  
  // Content
  inputData       Json?    @db.JsonB  // Form inputs
  generatedOutput String?  @db.Text   // AI-generated content
  fileUrl         String?  // Supabase Storage URL (for uploaded files)
  fileSize        Int?     // Bytes
  mimeType        String?  // 'application/pdf', 'image/jpeg', etc.
  
  // Status
  status          String   // 'draft', 'review', 'approved', 'submitted'
  version         Int      @default(1)
  
  // AI metadata
  aiGenerated     Boolean  @default(false)
  tokensUsed      Int?
  costUsd         Decimal? @db.Decimal(10, 4)
  
  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  // Relations
  organization    Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  case            Case? @relation(fields: [caseId], references: [id], onDelete: SetNull)
  caseDocuments   CaseDocument[]
  
  @@index([organizationId])
  @@index([caseId])
  @@index([type])
  @@index([status])
  @@map("documents")
}

// Junction table for case-document relationship
model CaseDocument {
  id         String   @id @default(uuid())
  caseId     String
  documentId String
  
  // Document role in case
  role       String   // 'primary', 'supporting', 'financial', 'educational'
  required   Boolean  @default(false)
  submitted  Boolean  @default(false)
  submittedAt DateTime?
  
  // Relations
  case       Case     @relation(fields: [caseId], references: [id], onDelete: Cascade)
  document   Document @relation(fields: [documentId], references: [id], onDelete: Cascade)
  
  @@unique([caseId, documentId])
  @@index([caseId])
  @@map("case_documents")
}

// ============================================
// TASK (Deadline & Task Tracking)
// ============================================
model Task {
  id             String   @id @default(uuid())
  organizationId String
  caseId         String?
  assignedToId   String?  // User ID
  
  // Task details
  title          String
  description    String?  @db.Text
  type           String   // 'document', 'deadline', 'follow_up', 'review', 'submission'
  priority       String   // 'low', 'medium', 'high', 'urgent'
  status         String   // 'todo', 'in_progress', 'completed', 'cancelled'
  
  // Dates
  dueDate        DateTime?
  completedAt    DateTime?
  
  // Relations
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  case           Case? @relation(fields: [caseId], references: [id], onDelete: Cascade)
  assignedTo     User? @relation(fields: [assignedToId], references: [id])
  
  @@index([organizationId])
  @@index([caseId])
  @@index([assignedToId])
  @@index([status])
  @@index([dueDate])
  @@map("tasks")
}

// ============================================
// COMMUNICATION (Client Portal)
// ============================================
model Communication {
  id             String   @id @default(uuid())
  organizationId String
  caseId         String?
  fromUserId     String
  toUserId       String?
  
  // Message
  subject        String?
  message        String   @db.Text
  type           String   // 'message', 'note', 'update', 'reminder'
  
  // Attachments
  attachments    Json?    @db.JsonB  // Array of file URLs
  
  // Status
  read           Boolean  @default(false)
  readAt         DateTime?
  
  // Timestamps
  createdAt      DateTime @default(now())
  
  // Relations
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  case           Case? @relation(fields: [caseId], references: [id], onDelete: Cascade)
  fromUser       User @relation("SentMessages", fields: [fromUserId], references: [id])
  toUser         User? @relation("ReceivedMessages", fields: [toUserId], references: [id])
  
  @@index([organizationId])
  @@index([caseId])
  @@index([fromUserId])
  @@index([toUserId])
  @@index([read])
  @@map("communications")
}

// ============================================
// CHECKLIST (Case-Specific Requirements)
// ============================================
model Checklist {
  id           String   @id @default(uuid())
  country      String
  visaType     String
  requirements Json     @db.JsonB  // Array of requirement objects
  lastUpdated  DateTime @default(now())
  
  @@unique([country, visaType])
  @@index([country])
  @@index([visaType])
  @@map("checklists")
}

model CaseChecklist {
  id         String   @id @default(uuid())
  caseId     String
  checklistId String
  
  // Status for each requirement
  items      Json     @db.JsonB  // { requirementId: { status, notes, completedAt } }
  completed  Boolean  @default(false)
  completedAt DateTime?
  
  // Relations
  case       Case     @relation(fields: [caseId], references: [id], onDelete: Cascade)
  checklist  Checklist @relation(fields: [checklistId], references: [id])
  
  @@unique([caseId, checklistId])
  @@map("case_checklists")
}

// ============================================
// SUBSCRIPTION (Organization Billing)
// ============================================
model Subscription {
  id                   String    @id @default(uuid())
  organizationId       String    @unique
  
  // Plan details
  plan                 String    // 'starter', 'professional', 'enterprise'
  status               String    // 'active', 'inactive', 'cancelled', 'past_due'
  
  // Payment gateway IDs
  stripeSubscriptionId String?   @unique
  stripeCustomerId     String?
  paystackSubscriptionId String? @unique
  paystackCustomerId   String?
  flutterwaveSubscriptionId String? @unique
  flutterwaveCustomerId String?
  
  // Billing period
  currentPeriodStart   DateTime?
  currentPeriodEnd     DateTime?
  cancelAtPeriodEnd   Boolean  @default(false)
  
  // Timestamps
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt
  
  // Relations
  organization         Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  
  @@index([status])
  @@map("subscriptions")
}

// ============================================
// API USAGE (Tracking & Billing)
// ============================================
model ApiUsage {
  id         String   @id @default(uuid())
  organizationId String
  userId     String?
  caseId     String?
  
  feature    String   // 'sop_generation', 'visa_check', 'ai_chat', etc.
  tokensUsed Int?
  costUsd    Decimal? @db.Decimal(10, 4)
  success    Boolean  @default(true)
  timestamp  DateTime @default(now())
  
  // Relations
  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  user         User? @relation(fields: [userId], references: [id])
  case         Case? @relation(fields: [caseId], references: [id])
  
  @@index([organizationId])
  @@index([userId])
  @@index([timestamp])
  @@map("api_usage")
}
```

---

## 🔐 Supabase Integration Strategy

### 1. **Supabase Auth**
- Use Supabase for user authentication
- Store user metadata in our Prisma `User` table
- Link via `supabaseUserId` field

### 2. **Row-Level Security (RLS)**
- Enable RLS on all tables
- Policies based on `organizationId`
- Example: Users can only see cases in their organization

### 3. **Supabase Storage**
- Store uploaded documents (passports, transcripts, etc.)
- Store organization logos (white-label)
- Generate signed URLs for secure access

### 4. **Prisma + Supabase Hybrid**
- Prisma handles: Complex queries, migrations, business logic
- Supabase handles: Auth, RLS enforcement, file storage
- Best of both worlds!

---

## 🚀 Implementation Phases

### **Phase 1: Foundation (Week 1-2)**
1. Set up Supabase project
2. Create Prisma schema (above)
3. Run migrations
4. Set up Supabase Auth
5. Create basic organization creation flow
6. Test multi-tenancy isolation

### **Phase 2: Roles & Team (Week 3)**
1. Implement role-based access (Admin, Professional, Applicant)
2. Create team invitation system
3. Build organization dashboard
4. Add user management UI

### **Phase 3: Case Management (Week 4-5)**
1. Create case creation flow
2. Link documents to cases
3. Build case dashboard
4. Add case status workflow
5. Implement case search/filtering

### **Phase 4: Client Portal (Week 6)**
1. Build applicant-facing UI
2. Add case view for applicants
3. Document upload functionality
4. Communication portal
5. Case status tracking

### **Phase 5: Payments (Week 7)**
1. Integrate Stripe
2. Add Paystack
3. Add Flutterwave
4. Organization-level billing
5. Subscription management

### **Phase 6: White-Label (Week 8)**
1. Branding settings UI
2. Apply branding to documents
3. Apply branding to emails
4. Custom domain support (optional)

---

## 🔧 Technical Setup

### Supabase Setup:
```bash
# Install Supabase client
npm install @supabase/supabase-js

# Environment variables
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Prisma Setup:
```bash
# Keep existing Prisma setup
# Add new models to schema.prisma
# Run migrations
npx prisma migrate dev --name add_multi_tenant
```

### RLS Policies (Supabase SQL):
```sql
-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their organization's data
CREATE POLICY "Users see own organization data"
ON cases FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id 
    FROM organization_users 
    WHERE user_id = auth.uid()
  )
);
```

---

## ✅ Next Steps

1. **Set up Supabase project** (if not done)
2. **Update Prisma schema** with new models
3. **Create migration** for new tables
4. **Set up Supabase Auth** integration
5. **Implement RLS policies**
6. **Start Phase 1 implementation**

**Ready to start?** Let me know and I'll begin with Phase 1! 🚀
