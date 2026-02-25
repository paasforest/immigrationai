# 🏗️ Corrected Architecture Plan: Multi-Tenant B2B2C Platform

## ✅ Current Stack Analysis

### What You're Currently Using:
- ✅ **Auth**: Custom JWT-based authentication (NOT Supabase)
- ✅ **Database**: PostgreSQL with Prisma ORM
- ✅ **Backend**: Express.js + TypeScript
- ✅ **Payments**: PayFast, Yoco, Stripe, Bank Transfer
- ✅ **Hosting**: Hetzner (backend) + Vercel (frontend)

### Decision: **NO Supabase** ✅
- Keep your current JWT auth system
- Keep Prisma for database
- Build multi-tenancy with application-level security (not RLS)

---

## 💰 Payment Model Clarification

### Important Business Model Question:

**You asked:** *"Agencies payments from their clients - should it not be paid directly to the agencies and not to our platform?"*

### Answer: **YES - Two Separate Payment Flows**

#### 1. **Platform Subscription Payments** (Agencies → Platform)
- **Who pays**: Immigration agencies/consultancies
- **What for**: Software subscription (monthly/annual)
- **Payment methods**: PayFast, Yoco, Stripe, Bank Transfer (your current system)
- **Handled by**: Your platform
- **Example**: Agency pays R699/month for Professional plan

#### 2. **Client Service Payments** (Clients → Agencies)
- **Who pays**: Individual applicants/clients
- **What for**: Immigration services (consulting, case handling)
- **Payment methods**: Whatever the agency uses (bank transfer, cash, etc.)
- **Handled by**: Agencies directly (NOT your platform)
- **Example**: Client pays agency R5,000 for visa application service

### Why This Makes Sense:
- ✅ Agencies are your customers (they pay for software)
- ✅ Clients are agencies' customers (they pay agencies for services)
- ✅ You don't need to handle client-to-agency payments
- ✅ Simpler compliance (no need to handle client money)
- ✅ Agencies keep their existing payment processes

### What Your Platform Handles:
- ✅ Agency subscription billing (current system)
- ✅ Usage tracking (API calls, document generations)
- ✅ Case management (for agencies to manage client cases)
- ✅ Client portal (for clients to view their cases with agencies)

### What Your Platform Does NOT Handle:
- ❌ Client-to-agency payments (that's between them)
- ❌ Agency revenue collection (agencies handle this themselves)

---

## 🏗️ Updated Architecture (No Supabase)

### Tech Stack:
```
Frontend: Next.js 14 (App Router)
Backend: Express.js + Prisma
Database: PostgreSQL (Hetzner)
Auth: Custom JWT (current system)
Storage: Local file storage or S3-compatible (Hetzner)
Payments: PayFast + Yoco + Stripe + Bank Transfer (current system)
Email: Resend
```

### Multi-Tenancy Strategy:
**Application-Level Security** (instead of Supabase RLS)

1. **Organization Context Middleware**
   - Extract organization from JWT token
   - Add to request context
   - All queries filter by `organizationId`

2. **Prisma Query Filtering**
   - Every query includes `organizationId` filter
   - Middleware enforces this automatically

3. **Role-Based Access Control**
   - Check user role in organization
   - Enforce permissions in middleware

---

## 📊 Database Schema (Updated - No Supabase)

### Key Changes:
- ✅ Keep current JWT auth system
- ✅ Add Organization model
- ✅ Add OrganizationUser (role-based membership)
- ✅ Add Case model
- ✅ Link everything to organizations

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
  branding          Json?    // { logo: string, primaryColor: string }
  
  // Settings
  settings          Json?    // Feature flags, preferences
  
  // Timestamps
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  // Relations
  users             OrganizationUser[]
  cases             Case[]
  documents         Document[]
  tasks             Task[]
  communications    Communication[]
  subscription      Subscription?
  
  @@index([slug])
  @@map("organizations")
}

// ============================================
// USER (Keep Current Model + Add Relations)
// ============================================
model User {
  id                String   @id @default(uuid())
  email             String   @unique
  passwordHash      String   @map("password_hash")
  fullName          String?  @map("full_name")
  companyName       String?  @map("company_name")
  role              String?  @default("user")
  subscriptionPlan  String   @default("starter") @map("subscription_plan")
  subscriptionStatus String  @default("inactive") @map("subscription_status")
  accountNumber     String?  @unique @map("account_number")
  
  // Timestamps
  createdAt         DateTime @default(now()) @map("created_at")
  updatedAt         DateTime @updatedAt @map("updated_at")
  
  // NEW: Organization Relations
  organizationMemberships OrganizationUser[]
  casesAsApplicant  Case[] @relation("ApplicantCases")
  casesAsProfessional Case[] @relation("ProfessionalCases")
  
  // Existing Relations (keep these)
  documents         Document[]
  apiUsage          ApiUsage[]
  subscriptions     Subscription[]
  refreshTokens     RefreshToken[]
  passwordResetTokens PasswordResetToken[]
  documentFeedback  DocumentFeedback[]
  applicationOutcomes ApplicationOutcome[]
  userTracking      UserTracking?
  mockInterviews    MockInterview[]
  interviewSessions InterviewSession[]
  interviewProgress UserInterviewProgress[]
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
  status         String   // 'draft', 'in_progress', 'document_review', 'submitted', 'interview', 'approved', 'rejected'
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
// DOCUMENT (Updated - Link to Cases)
// ============================================
model Document {
  id              String   @id @default(uuid())
  organizationId  String   // NEW: Organization context
  caseId          String?  // NEW: Link to case (if case-specific)
  userId           String?  // Keep for backward compatibility
  
  // Document info
  type            String   // 'sop', 'cover_letter', 'support_letter', 'passport', 'transcript', etc.
  title           String
  category        String?  // 'application', 'supporting', 'financial', 'educational'
  
  // Content
  inputData       Json?    @db.JsonB
  generatedOutput String?  @db.Text
  fileUrl         String?  // File storage URL
  fileSize        Int?
  mimeType        String?
  
  // Status
  status          String   @default("draft")
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
  user            User? @relation(fields: [userId], references: [id], onDelete: SetNull)
  caseDocuments   CaseDocument[]
  
  @@index([organizationId])
  @@index([caseId])
  @@index([userId])
  @@index([type])
  @@map("documents")
}

// ============================================
// SUBSCRIPTION (Organization-Level Billing)
// ============================================
model Subscription {
  id                   String    @id @default(uuid())
  organizationId       String    @unique  // Changed from userId
  
  // Plan details
  plan                 String
  status               String
  
  // Payment gateway IDs (your current system)
  stripeSubscriptionId String?
  stripeCustomerId     String?
  payfastSubscriptionId String?
  payfastCustomerId    String?
  yocoSubscriptionId   String?
  yocoCustomerId       String?
  accountNumber        String?   // Bank transfer account number
  
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
// TASK (Deadline & Task Tracking)
// ============================================
model Task {
  id             String   @id @default(uuid())
  organizationId String
  caseId         String?
  assignedToId   String?
  
  title          String
  description    String?  @db.Text
  type           String   // 'document', 'deadline', 'follow_up', 'review'
  priority       String
  status         String   // 'todo', 'in_progress', 'completed', 'cancelled'
  
  dueDate        DateTime?
  completedAt    DateTime?
  
  // Relations
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  case           Case? @relation(fields: [caseId], references: [id], onDelete: Cascade)
  assignedTo     User? @relation(fields: [assignedToId], references: [id])
  
  @@index([organizationId])
  @@index([caseId])
  @@index([assignedToId])
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
  
  subject        String?
  message        String   @db.Text
  type           String   // 'message', 'note', 'update', 'reminder'
  
  attachments    Json?    @db.JsonB
  
  read           Boolean  @default(false)
  readAt         DateTime?
  
  createdAt      DateTime @default(now())
  
  // Relations
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  case           Case? @relation(fields: [caseId], references: [id], onDelete: Cascade)
  fromUser       User @relation("SentMessages", fields: [fromUserId], references: [id])
  toUser         User? @relation("ReceivedMessages", fields: [toUserId], references: [id])
  
  @@index([organizationId])
  @@index([caseId])
  @@map("communications")
}
```

---

## 🔐 Multi-Tenancy Implementation (Application-Level)

### 1. **Organization Context Middleware**

```typescript
// backend/src/middleware/organizationContext.ts
export async function organizationContext(req: Request, res: Response, next: NextFunction) {
  const userId = req.user?.id; // From JWT auth middleware
  
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // Get user's organization memberships
  const memberships = await prisma.organizationUser.findMany({
    where: { userId, status: 'active' },
    include: { organization: true }
  });
  
  // For now, use primary organization (can extend to multi-org later)
  const primaryOrg = memberships[0]?.organization;
  
  if (!primaryOrg) {
    return res.status(403).json({ error: 'No organization found' });
  }
  
  // Add to request context
  req.organization = primaryOrg;
  req.organizationRole = memberships[0]?.role;
  
  next();
}
```

### 2. **Prisma Query Filtering**

```typescript
// All queries automatically filter by organizationId
const cases = await prisma.case.findMany({
  where: {
    organizationId: req.organization.id, // From middleware
    // ... other filters
  }
});
```

### 3. **Role-Based Access Control**

```typescript
// backend/src/middleware/requireRole.ts
export function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.organizationRole;
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
}

// Usage:
router.get('/cases', 
  auth, 
  organizationContext, 
  requireRole('admin', 'professional'),
  getCases
);
```

---

## 💰 Payment Flow (Clarified)

### Agency Subscription Payments (Platform Handles):
```
Agency → PayFast/Yoco/Stripe/Bank Transfer → Platform
Purpose: Software subscription (R699/month)
Your current payment system handles this ✅
```

### Client Service Payments (Agencies Handle):
```
Client → Bank Transfer/Cash/etc. → Agency
Purpose: Immigration services (R5,000 for visa application)
NOT handled by your platform ✅
```

---

## 🚀 Implementation Phases (Updated)

### **Phase 1: Foundation (Week 1-2)**
1. Add Organization model to Prisma
2. Add OrganizationUser model
3. Create organization context middleware
4. Update existing queries to include organizationId
5. Test multi-tenancy isolation

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

### **Phase 4: Client Portal (Week 6)**
1. Build applicant-facing UI
2. Add case view for applicants
3. Document upload functionality
4. Communication portal

### **Phase 5: White-Label (Week 7)**
1. Branding settings UI
2. Apply branding to documents
3. Apply branding to emails

**Note:** Payment integration is already done (your current system) ✅

---

## ✅ Summary

1. ✅ **NO Supabase** - Keep current JWT auth + Prisma
2. ✅ **Payment Model** - Platform handles agency subscriptions, agencies handle client payments
3. ✅ **Multi-Tenancy** - Application-level security with middleware
4. ✅ **Current Stack** - Keep everything you have, just add organization layer

**Ready to start Phase 1?** 🚀
