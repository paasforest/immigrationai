# ✅ Phase 1 Approach Review & Corrections

## Overall Assessment: **GOOD APPROACH** ✅

The phased approach is solid, but there are **critical conflicts** with your existing schema that need fixing before implementation.

---

## ⚠️ Critical Issues to Fix

### 1. **ID Generation Mismatch** ❌
**Problem:**
- Your existing schema uses: `@default(dbgenerated("gen_random_uuid()")) @db.Uuid`
- Prompt uses: `@default(cuid())`
- **Conflict**: Different ID generation methods

**Fix:**
```prisma
// Use UUID to match existing schema
id String @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
```

---

### 2. **User Model Field Conflicts** ⚠️

**Existing Fields:**
- ✅ `fullName` (not `firstName`/`lastName`)
- ✅ `role` (default: "user", not "professional")
- ✅ `subscriptionPlan` and `subscriptionStatus` (these should move to Organization)

**Missing Fields to Add:**
- `organizationId` String? (nullable for backward compatibility)
- `phone` String?
- `avatarUrl` String?
- `isActive` Boolean @default(true)

**Fix:**
```prisma
model User {
  // ... existing fields ...
  
  // NEW: Organization fields
  organizationId String? @map("organization_id") @db.Uuid
  organization   Organization? @relation(fields: [organizationId], references: [id])
  
  // NEW: Additional fields
  phone          String? @db.VarChar(50)
  avatarUrl      String? @map("avatar_url") @db.VarChar(500)
  isActive       Boolean @default(true) @map("is_active")
  
  // UPDATE: Role field already exists, but change default
  role           String? @default("user") @db.VarChar(50) // Keep existing
  
  // NOTE: fullName already exists, don't add firstName/lastName
  // NOTE: subscriptionPlan/Status stay for backward compatibility (will be deprecated)
  
  // NEW: Relations for multi-tenancy
  assignedCases  Case[] @relation("AssignedCases")
  applicantCases Case[] @relation("ApplicantCases")
  assignedTasks  Task[] @relation("AssignedTasks")
  createdTasks   Task[] @relation("CreatedTasks")
  sentMessages   Message[] @relation("SentMessages")
  receivedMessages Message[] @relation("ReceivedMessages")
  auditLogs      AuditLog[]
}
```

---

### 3. **Document Model - MAJOR CONFLICT** ⚠️⚠️⚠️

**Problem:**
- **Existing Document**: AI-generated documents (SOP, cover letters, etc.)
  - Fields: `userId`, `type`, `title`, `inputData`, `generatedOutput`, `status`
  
- **New Document**: File uploads (passports, transcripts, etc.)
  - Fields: `caseId`, `organizationId`, `uploadedById`, `name`, `fileUrl`, `fileSize`

**These are DIFFERENT use cases!**

**Solution Options:**

#### Option A: Rename New Model (Recommended)
```prisma
// Keep existing Document for AI-generated docs
model Document {
  // ... existing fields stay the same ...
}

// NEW: Separate model for file uploads
model CaseDocument {
  id             String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  caseId         String    @map("case_id") @db.Uuid
  case           Case      @relation(fields: [caseId], references: [id])
  organizationId String    @map("organization_id") @db.Uuid
  organization   Organization @relation(fields: [organizationId], references: [id])
  uploadedById   String    @map("uploaded_by_id") @db.Uuid
  uploadedBy     User      @relation(fields: [uploadedById], references: [id])
  name           String
  category       String?   // identity, financial, educational, etc.
  fileUrl        String    @map("file_url") @db.VarChar(500)
  fileSize       BigInt?   @map("file_size")
  fileType       String?   @map("file_type") @db.VarChar(100)
  status         String    @default("pending_review") @db.VarChar(50)
  expiryDate     DateTime? @map("expiry_date") @db.Timestamp(6)
  notes          String?   @db.Text
  version        Int       @default(1)
  createdAt      DateTime  @default(now()) @map("created_at") @db.Timestamp(6)
  updatedAt      DateTime  @updatedAt @map("updated_at") @db.Timestamp(6)

  checklistItems ChecklistItem[]
  
  @@index([caseId])
  @@index([organizationId])
  @@index([uploadedById])
  @@map("case_documents")
}
```

#### Option B: Merge Models (Complex)
- Add new fields to existing Document
- Make `userId` optional
- Add `caseId` and `organizationId`
- **Risk**: Breaks existing code

**Recommendation: Option A (Separate Models)**

---

### 4. **Subscription Model Conflict** ⚠️

**Problem:**
- Current: `userId` (individual subscriptions)
- New: `organizationId` (organization subscriptions)

**Solution:**
```prisma
model Subscription {
  id                   String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  
  // CHANGE: From userId to organizationId
  organizationId       String    @map("organization_id") @db.Uuid
  organization         Organization @relation(fields: [organizationId], references: [id])
  
  // Keep existing payment fields
  plan                 String    @db.VarChar(50)
  stripeSubscriptionId String?   @unique @map("stripe_subscription_id") @db.VarChar(255)
  stripeCustomerId     String?   @map("stripe_customer_id") @db.VarChar(255)
  
  // NEW: Additional payment methods
  payfastSubscriptionId String? @map("payfast_subscription_id") @db.VarChar(255)
  yocoSubscriptionId    String? @map("yoco_subscription_id") @db.VarChar(255)
  accountNumber         String? @map("account_number") @db.VarChar(50)
  
  status               String    @default("trial") @db.VarChar(50)
  paymentMethod        String?   @map("payment_method") @db.VarChar(50)
  amount               Decimal? @db.Decimal(10, 2)
  currency             String    @default("ZAR") @db.VarChar(10)
  billingCycle         String    @default("monthly") @map("billing_cycle") @db.VarChar(20)
  
  currentPeriodStart   DateTime? @map("current_period_start") @db.Timestamp(6)
  currentPeriodEnd     DateTime? @map("current_period_end") @db.Timestamp(6)
  cancelledAt          DateTime? @map("cancelled_at") @db.Timestamp(6)
  
  createdAt            DateTime  @default(now()) @map("created_at") @db.Timestamp(6)
  updatedAt            DateTime  @updatedAt @map("updated_at") @db.Timestamp(6)

  @@index([organizationId])
  @@index([status])
  @@map("subscriptions")
}
```

**Migration Strategy:**
- For existing users, create a "personal" organization
- Move their subscription to the organization
- Keep `userId` field temporarily for migration, then remove

---

### 5. **Organization Model - Use UUID** ✅

```prisma
model Organization {
  id               String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name             String    @db.VarChar(255)
  slug             String    @unique @db.VarChar(255)
  plan             String    @default("starter") @db.VarChar(50)
  planStatus       String    @default("trial") @map("plan_status") @db.VarChar(50)
  trialEndsAt      DateTime? @map("trial_ends_at") @db.Timestamp(6)
  billingEmail     String?   @map("billing_email") @db.VarChar(255)
  country          String?   @db.VarChar(100)
  phone            String?   @db.VarChar(50)
  logoUrl          String?   @map("logo_url") @db.VarChar(500)
  isActive         Boolean   @default(true) @map("is_active")
  createdAt        DateTime  @default(now()) @map("created_at") @db.Timestamp(6)
  updatedAt        DateTime  @updatedAt @map("updated_at") @db.Timestamp(6)

  users            User[]
  cases            Case[]
  documents        CaseDocument[]  // Use CaseDocument, not Document
  tasks            Task[]
  messages         Message[]
  subscriptions   Subscription[]
  auditLogs        AuditLog[]

  @@index([slug])
  @@index([isActive])
  @@map("organizations")
}
```

---

## ✅ Corrected Prompt 1A

Here's the corrected version:

```prisma
// ============================================
// ORGANIZATION MODEL
// ============================================
model Organization {
  id               String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name             String    @db.VarChar(255)
  slug             String    @unique @db.VarChar(255)
  plan             String    @default("starter") @db.VarChar(50)
  planStatus       String    @default("trial") @map("plan_status") @db.VarChar(50)
  trialEndsAt      DateTime? @map("trial_ends_at") @db.Timestamp(6)
  billingEmail     String?   @map("billing_email") @db.VarChar(255)
  country          String?   @db.VarChar(100)
  phone            String?   @db.VarChar(50)
  logoUrl          String?   @map("logo_url") @db.VarChar(500)
  isActive         Boolean   @default(true) @map("is_active")
  createdAt        DateTime  @default(now()) @map("created_at") @db.Timestamp(6)
  updatedAt        DateTime  @updatedAt @map("updated_at") @db.Timestamp(6)

  users            User[]
  cases            Case[]
  caseDocuments    CaseDocument[]  // Separate from Document
  tasks            Task[]
  messages         Message[]
  subscriptions    Subscription[]
  auditLogs        AuditLog[]

  @@index([slug])
  @@index([isActive])
  @@map("organizations")
}

// ============================================
// UPDATE USER MODEL (Add to existing)
// ============================================
model User {
  // ... ALL EXISTING FIELDS STAY THE SAME ...
  
  // NEW: Organization relationship
  organizationId   String?   @map("organization_id") @db.Uuid
  organization     Organization? @relation(fields: [organizationId], references: [id])
  
  // NEW: Additional fields
  phone            String?   @db.VarChar(50)
  avatarUrl        String?   @map("avatar_url") @db.VarChar(500)
  isActive         Boolean   @default(true) @map("is_active")
  
  // NEW: Relations for multi-tenancy
  assignedCases    Case[] @relation("AssignedCases")
  applicantCases   Case[] @relation("ApplicantCases")
  assignedTasks    Task[] @relation("AssignedTasks")
  createdTasks     Task[] @relation("CreatedTasks")
  sentMessages     Message[] @relation("SentMessages")
  receivedMessages Message[] @relation("ReceivedMessages")
  auditLogs        AuditLog[]
  
  // NOTE: role field already exists, keep it
  // NOTE: fullName already exists, don't add firstName/lastName
}

// ============================================
// CASE MODEL (New)
// ============================================
model Case {
  id                     String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  organizationId         String    @map("organization_id") @db.Uuid
  organization           Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  assignedProfessionalId String?   @map("assigned_professional_id") @db.Uuid
  assignedProfessional   User?     @relation("AssignedCases", fields: [assignedProfessionalId], references: [id])
  applicantId            String?   @map("applicant_id") @db.Uuid
  applicant              User?     @relation("ApplicantCases", fields: [applicantId], references: [id])
  referenceNumber        String    @unique @map("reference_number") @db.VarChar(50)
  status                 String    @default("open") @db.VarChar(50)
  visaType               String?   @map("visa_type") @db.VarChar(100)
  originCountry          String?   @map("origin_country") @db.VarChar(100)
  destinationCountry     String?   @map("destination_country") @db.VarChar(100)
  title                  String    @db.VarChar(255)
  notes                  String?   @db.Text
  priority               String    @default("normal") @db.VarChar(50)
  submissionDeadline     DateTime? @map("submission_deadline") @db.Timestamp(6)
  submittedAt            DateTime? @map("submitted_at") @db.Timestamp(6)
  decisionAt             DateTime? @map("decision_at") @db.Timestamp(6)
  outcome                String?   @db.VarChar(50)
  createdAt              DateTime  @default(now()) @map("created_at") @db.Timestamp(6)
  updatedAt              DateTime  @updatedAt @map("updated_at") @db.Timestamp(6)

  caseDocuments          CaseDocument[]
  tasks                  Task[]
  messages               Message[]
  checklists             DocumentChecklist[]

  @@index([organizationId])
  @@index([assignedProfessionalId])
  @@index([applicantId])
  @@index([referenceNumber])
  @@index([status])
  @@map("cases")
}

// ============================================
// CASE DOCUMENT MODEL (New - Separate from Document)
// ============================================
model CaseDocument {
  id             String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  caseId         String    @map("case_id") @db.Uuid
  case           Case      @relation(fields: [caseId], references: [id], onDelete: Cascade)
  organizationId String    @map("organization_id") @db.Uuid
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  uploadedById   String    @map("uploaded_by_id") @db.Uuid
  uploadedBy      User      @relation(fields: [uploadedById], references: [id])
  name           String    @db.VarChar(255)
  category       String?   @db.VarChar(100)
  fileUrl        String    @map("file_url") @db.VarChar(500)
  fileSize       BigInt?   @map("file_size")
  fileType       String?   @map("file_type") @db.VarChar(100)
  status         String    @default("pending_review") @map("status") @db.VarChar(50)
  expiryDate     DateTime? @map("expiry_date") @db.Timestamp(6)
  notes          String?   @db.Text
  version        Int       @default(1)
  createdAt      DateTime  @default(now()) @map("created_at") @db.Timestamp(6)
  updatedAt      DateTime  @updatedAt @map("updated_at") @db.Timestamp(6)

  checklistItems ChecklistItem[]

  @@index([caseId])
  @@index([organizationId])
  @@index([uploadedById])
  @@map("case_documents")
}

// ============================================
// UPDATE SUBSCRIPTION MODEL
// ============================================
model Subscription {
  id                   String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  
  // CHANGE: From userId to organizationId
  organizationId       String    @map("organization_id") @db.Uuid
  organization         Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  
  plan                 String    @db.VarChar(50)
  status               String    @default("trial") @db.VarChar(50)
  paymentMethod        String?   @map("payment_method") @db.VarChar(50)
  amount               Decimal?   @db.Decimal(10, 2)
  currency             String    @default("ZAR") @db.VarChar(10)
  billingCycle         String    @default("monthly") @map("billing_cycle") @db.VarChar(20)
  
  // Existing payment gateway fields
  stripeSubscriptionId String?   @unique @map("stripe_subscription_id") @db.VarChar(255)
  stripeCustomerId     String?   @map("stripe_customer_id") @db.VarChar(255)
  
  // NEW: Additional payment methods
  payfastSubscriptionId String? @map("payfast_subscription_id") @db.VarChar(255)
  yocoSubscriptionId    String? @map("yoco_subscription_id") @db.VarChar(255)
  accountNumber         String? @map("account_number") @db.VarChar(50)
  
  currentPeriodStart   DateTime? @map("current_period_start") @db.Timestamp(6)
  currentPeriodEnd     DateTime? @map("current_period_end") @db.Timestamp(6)
  cancelledAt          DateTime? @map("cancelled_at") @db.Timestamp(6)
  
  createdAt            DateTime  @default(now()) @map("created_at") @db.Timestamp(6)
  updatedAt            DateTime  @updatedAt @map("updated_at") @db.Timestamp(6)

  @@index([organizationId])
  @@index([status])
  @@map("subscriptions")
}

// ============================================
// TASK, MESSAGE, CHECKLIST MODELS (New)
// ============================================
// (Keep as specified in original prompt, but use UUID)
```

---

## ✅ Summary of Changes Needed

1. ✅ **Use UUID** instead of `cuid()` for all IDs
2. ✅ **Keep existing Document model** for AI-generated docs
3. ✅ **Create CaseDocument model** for file uploads
4. ✅ **Update User model** - add `organizationId`, `phone`, `avatarUrl`, `isActive` (don't add firstName/lastName)
5. ✅ **Update Subscription model** - change from `userId` to `organizationId`
6. ✅ **Add proper indexes** and `@@map()` directives to match existing style

---

## 🚀 Ready to Proceed?

Once you fix these conflicts, the approach is **excellent**. The phased implementation is solid:

1. ✅ Prisma schema updates
2. ✅ Middleware for organization context
3. ✅ Helper functions for scoped queries
4. ✅ Organization routes and controllers

**Should I create the corrected schema file for you?** 🎯
