# 🏗️ Architecture Discussion: Multi-Tenant B2B2C Platform Extension

## 📊 Current State Analysis

### What You Have Now:
- **Architecture**: Next.js 13 (App Router) + Express.js backend
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: JWT-based, individual user accounts
- **User Model**: Single `User` table with `companyName` field (optional)
- **Subscription**: Individual plans (starter, entry, professional, enterprise)
- **Payment**: Bank transfer only
- **Features**: Self-service tools (SOP generation, visa checks, AI chat, interview practice)
- **Hosting**: Hetzner (backend) + Vercel (frontend)
- **Data Model**: User-centric (all documents/cases tied to individual users)

### Current Limitations:
1. ❌ No multi-tenancy (can't group users into organizations)
2. ❌ No role-based access (everyone is just a "user")
3. ❌ No case management system
4. ❌ No client/applicant portal
5. ❌ No white-label branding
6. ❌ Single payment method
7. ❌ Documents are user-owned, not case-owned

---

## 🎯 Desired State Analysis

### What You Want:
- **Architecture**: Next.js 14 + Supabase (PostgreSQL + RLS + Storage)
- **Database**: Multi-tenant with Row-Level Security (RLS)
- **Auth**: Supabase Auth with role-based access
- **User Roles**: Organization Admin, Professional, Applicant
- **Subscription**: Organization-level billing
- **Payment**: Stripe, Paystack, Flutterwave
- **Features**: Case management, client portal, document organization, white-label
- **Data Model**: Organization → Cases → Documents → Applicants

---

## 🤔 Key Architectural Decisions Needed

### 1. **Migration Strategy: Gradual vs. Rebuild?**

#### Option A: Gradual Migration (Recommended)
**Pros:**
- ✅ Keep existing users and data
- ✅ Lower risk
- ✅ Can launch new features incrementally
- ✅ Test with new users while maintaining current system

**Cons:**
- ⚠️ More complex (dual systems temporarily)
- ⚠️ Longer timeline
- ⚠️ Need data migration scripts

**Approach:**
1. Add new tables alongside existing ones
2. Create "Organization" model, link existing users
3. Migrate users gradually (opt-in)
4. Run both systems in parallel
5. Deprecate old system after migration

#### Option B: Complete Rebuild
**Pros:**
- ✅ Clean architecture from day one
- ✅ No legacy code
- ✅ Faster to build (no migration complexity)

**Cons:**
- ❌ Lose existing users/data
- ❌ High risk
- ❌ Long downtime
- ❌ Need to rebuild all features

**Recommendation: Option A (Gradual Migration)**

---

### 2. **Supabase Migration: Full or Hybrid?**

#### Option A: Full Supabase Migration
**Pros:**
- ✅ Built-in RLS for multi-tenancy
- ✅ File storage included
- ✅ Real-time subscriptions
- ✅ Auth built-in
- ✅ Edge functions

**Cons:**
- ⚠️ Need to migrate from Prisma
- ⚠️ Different query patterns
- ⚠️ Vendor lock-in
- ⚠️ Learning curve

#### Option B: Hybrid Approach (Recommended)
**Pros:**
- ✅ Keep Prisma for complex queries
- ✅ Use Supabase only for RLS + Storage
- ✅ Gradual migration
- ✅ Less vendor lock-in

**Cons:**
- ⚠️ Two systems to maintain
- ⚠️ More complex setup

**Recommendation: Option B (Hybrid)**
- Use Supabase for: Auth, RLS policies, File storage
- Keep Prisma for: Complex queries, migrations, type safety

---

### 3. **Multi-Tenancy Implementation**

#### Approach: Organization-Based with RLS

**Database Schema Changes Needed:**

```prisma
// NEW: Organization model
model Organization {
  id              String   @id @default(uuid())
  name            String
  slug            String   @unique  // For white-label URLs
  subscriptionPlan String
  subscriptionStatus String
  branding        Json?    // Logo, colors, custom domain
  settings        Json?    // Feature flags, preferences
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  // Relations
  users           OrganizationUser[]
  cases           Case[]
  documents       Document[]  // Organization-level templates
}

// NEW: Organization membership
model OrganizationUser {
  id             String   @id @default(uuid())
  organizationId String
  userId         String
  role           String   // 'admin', 'professional', 'applicant'
  invitedBy      String?
  joinedAt       DateTime @default(now())
  
  organization   Organization @relation(...)
  user           User @relation(...)
  
  @@unique([organizationId, userId])
}

// NEW: Case model
model Case {
  id             String   @id @default(uuid())
  organizationId String
  caseNumber     String   @unique
  applicantId    String?  // Link to applicant user
  professionalId String?  // Assigned professional
  visaType       String
  country        String
  status         String   // 'draft', 'in_progress', 'submitted', 'approved', 'rejected'
  priority       String
  deadline       DateTime?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  organization   Organization @relation(...)
  applicant      User? @relation(...)
  professional   User? @relation(...)
  documents      CaseDocument[]
  tasks          Task[]
  communications Communication[]
}

// MODIFY: Document model
model Document {
  // ... existing fields ...
  caseId          String?  // NEW: Link to case
  organizationId  String?  // NEW: For organization templates
  applicantId     String?  // NEW: For applicant-uploaded docs
  // ... rest of fields ...
}
```

**Row-Level Security (RLS) Policies:**
- Organization Admin: Can see all cases in their org
- Professional: Can see assigned cases only
- Applicant: Can see their own cases only

---

### 4. **User Role System**

#### Current: Single "user" role
#### Desired: Three roles (Admin, Professional, Applicant)

**Implementation Options:**

**Option A: Role per Organization (Recommended)**
- User can be Admin in Org A, Professional in Org B
- More flexible
- Supports marketplace model

**Option B: Global Role**
- User is always Admin OR Professional OR Applicant
- Simpler but less flexible

**Recommendation: Option A**

**Schema:**
```prisma
model OrganizationUser {
  role String // 'admin' | 'professional' | 'applicant'
  // User can have different roles in different orgs
}
```

---

### 5. **Payment Gateway Integration**

#### Current: Bank transfer only
#### Desired: Stripe + Paystack + Flutterwave

**Strategy:**
1. **Phase 1**: Add Stripe (global, easiest)
2. **Phase 2**: Add Paystack (Nigeria, Ghana)
3. **Phase 3**: Add Flutterwave (fallback, broader Africa)

**Billing Model Change:**
- **Current**: Individual subscription
- **Desired**: Organization subscription
- **Migration**: Link existing users to "personal" organizations

---

### 6. **Case Management System**

#### New Features Needed:
1. **Case Creation**: Professional creates case, assigns applicant
2. **Document Organization**: Documents linked to cases, not just users
3. **Checklist System**: Case-specific checklists
4. **Task Tracking**: Deadlines, reminders
5. **Communication Portal**: Messages between professional and applicant
6. **Status Tracking**: Case status workflow

**Database Changes:**
- New `Case` model
- New `CaseDocument` model (junction table)
- New `Task` model
- New `Communication` model
- Modify `Document` to support cases

---

### 7. **White-Label Branding**

#### Implementation:
1. **Organization Settings**: Logo, colors, custom domain
2. **Document Templates**: Branded headers/footers
3. **Email Templates**: Branded emails
4. **Client Portal**: Custom domain/subdomain

**Storage:**
- Use Supabase Storage for logos
- Store branding config in `Organization.branding` JSON field

---

## 📋 Phased Implementation Plan

### **Phase 1: Foundation (Weeks 1-4)**
**Goal**: Add multi-tenancy without breaking existing system

1. ✅ Add `Organization` model
2. ✅ Add `OrganizationUser` model
3. ✅ Create migration script: Auto-create "personal" orgs for existing users
4. ✅ Add RLS policies (Supabase or application-level)
5. ✅ Update auth to support organization context
6. ✅ Test with existing users (should work seamlessly)

**Deliverable**: Existing users can continue using platform, new users can create organizations

---

### **Phase 2: Role-Based Access (Weeks 5-6)**
**Goal**: Implement three-role system

1. ✅ Add role field to `OrganizationUser`
2. ✅ Create role-based middleware
3. ✅ Update UI to show/hide features based on role
4. ✅ Add organization admin dashboard
5. ✅ Add team management (invite users)

**Deliverable**: Organizations can invite team members with different roles

---

### **Phase 3: Case Management (Weeks 7-10)**
**Goal**: Build core case management features

1. ✅ Create `Case` model
2. ✅ Create case creation UI
3. ✅ Link documents to cases
4. ✅ Add case dashboard
5. ✅ Add case status workflow
6. ✅ Add basic checklist system

**Deliverable**: Professionals can create and manage cases

---

### **Phase 4: Client Portal (Weeks 11-12)**
**Goal**: Applicant-facing portal

1. ✅ Create applicant role UI
2. ✅ Add case view for applicants
3. ✅ Add document upload
4. ✅ Add communication portal
5. ✅ Add case status tracking

**Deliverable**: Applicants can view their cases and communicate with professionals

---

### **Phase 5: Payment Integration (Weeks 13-14)**
**Goal**: Multi-gateway payment system

1. ✅ Integrate Stripe
2. ✅ Move billing to organization level
3. ✅ Add Paystack integration
4. ✅ Add Flutterwave integration
5. ✅ Migrate existing subscriptions

**Deliverable**: Organizations can pay via multiple gateways

---

### **Phase 6: White-Label (Weeks 15-16)**
**Goal**: Branding customization

1. ✅ Add branding settings UI
2. ✅ Apply branding to documents
3. ✅ Apply branding to emails
4. ✅ Add custom domain support (optional)

**Deliverable**: Organizations can customize their branding

---

## ⚠️ Risks & Considerations

### 1. **Data Migration Risk**
- **Risk**: Losing existing user data
- **Mitigation**: 
  - Create comprehensive backup
  - Test migration on staging
  - Run in parallel initially
  - Rollback plan ready

### 2. **Breaking Changes**
- **Risk**: Existing users can't access features
- **Mitigation**:
  - Gradual rollout
  - Feature flags
  - Maintain backward compatibility
  - Clear communication

### 3. **Performance Impact**
- **Risk**: RLS policies slow down queries
- **Mitigation**:
  - Optimize indexes
  - Cache organization context
  - Monitor query performance

### 4. **Complexity Increase**
- **Risk**: Codebase becomes harder to maintain
- **Mitigation**:
  - Clear architecture documentation
  - Code reviews
  - Automated tests
  - Gradual refactoring

### 5. **Supabase Learning Curve**
- **Risk**: Team needs to learn new tools
- **Mitigation**:
  - Start with hybrid approach
  - Gradual migration
  - Training sessions
  - Documentation

---

## 🎯 Recommended Approach

### **Hybrid Gradual Migration**

1. **Keep Current System Running**
   - Don't break existing users
   - Maintain all current features

2. **Add New Tables Alongside**
   - Create Organization, Case, etc.
   - Link to existing User table
   - Run both systems in parallel

3. **Use Supabase Selectively**
   - Use for: Auth, RLS, File Storage
   - Keep Prisma for: Complex queries, migrations
   - Gradual migration of features

4. **Phased Rollout**
   - Phase 1: Multi-tenancy (invisible to users)
   - Phase 2: Roles (opt-in for new orgs)
   - Phase 3: Case management (new feature)
   - Phase 4: Client portal (new feature)
   - Phase 5: Payments (migrate existing)
   - Phase 6: White-label (new feature)

5. **Migration Path for Existing Users**
   - Auto-create "personal" organization
   - Migrate documents to "personal" case
   - User doesn't notice difference
   - Can upgrade to full org later

---

## ❓ Questions to Discuss

1. **Timeline**: How urgent is this? Can we do gradual migration?
2. **Existing Users**: How many active users? Can we migrate them?
3. **Budget**: Can we afford Supabase? (Pricing considerations)
4. **Team**: Who will maintain this? Technical capacity?
5. **Priority**: Which phase is most important? (Case management vs. payments vs. white-label)
6. **Marketplace**: Is marketplace a Phase 3 feature or later?
7. **Supabase**: Are you committed to Supabase, or open to alternatives?

---

## 🚀 Next Steps (After Discussion)

1. **Decide on migration strategy** (gradual vs. rebuild)
2. **Decide on Supabase** (full vs. hybrid)
3. **Prioritize phases** (what's most important?)
4. **Create detailed technical spec** for Phase 1
5. **Set up development environment** (Supabase project, etc.)
6. **Start Phase 1 implementation**

---

**Let's discuss these points before we start coding!** 🎯
