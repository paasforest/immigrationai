# 🏗️ Immigration AI Platform - Project Summary

## 📋 Project Overview

**Immigration AI** is a multi-tenant B2B2C SaaS platform for immigration agencies to manage client cases, documents, tasks, and communications. The platform enables agencies (organizations) to onboard professionals and manage applicant cases efficiently.

---

## 🏛️ Architecture

### **Multi-Tenant B2B2C Model**
- **Platform** → Agencies (Organizations) pay for subscriptions
- **Agencies** → Clients (Applicants) pay agencies directly for services
- **Data Isolation** → Complete organization-level data separation

### **Tech Stack**

**Backend:**
- Node.js + Express.js (TypeScript)
- Prisma ORM + PostgreSQL
- JWT Authentication
- Multer for file uploads
- PM2 for process management

**Frontend:**
- Next.js 14+ (React)
- TypeScript
- Tailwind CSS (assumed)

**Infrastructure:**
- **Backend:** Hetzner Server (78.46.183.41)
- **Frontend:** Vercel (auto-deploy from Git)
- **Database:** PostgreSQL on Hetzner

---

## ✅ Phase 1 - Multi-Tenant Foundation (COMPLETE)

### **Database Schema**

**New Models:**
- `Organization` - Multi-tenant organizations
- `Case` - Immigration cases
- `CaseDocument` - File uploads (separate from AI-generated documents)
- `Task` - Task management
- `Message` - Communication
- `DocumentChecklist` - Case-specific checklists
- `ChecklistItem` - Checklist requirements
- `AuditLog` - Activity tracking
- `OrganizationSubscription` - Organization-based subscriptions

**Updated Models:**
- `User` - Added: `organizationId`, `phone`, `avatarUrl`, `isActive`
- `Subscription` - Changed: `userId` → `organizationId`

**Additional Models (Existing):**
- `EligibilityCheck` - Homepage quick assessments
- `MarketingSession` - UTM tracking
- `PendingPayment` - Bank transfer tracking

### **Backend Components Created:**

1. **`src/middleware/organizationContext.ts`**
   - Extracts organization context from authenticated user
   - Validates organization exists and is active
   - Sets `req.organizationId`, `req.organization`, `req.organizationRole`

2. **`src/helpers/prismaScopes.ts`**
   - Scoped query helpers that automatically inject `organizationId`
   - Functions: `getCasesByOrg`, `getCaseById`, `createCase`, `updateCase`, `deleteCase`, etc.
   - Ensures data isolation at application level

3. **`src/utils/referenceNumber.ts`**
   - Generates unique case reference numbers
   - Format: `IMM-[YEAR]-[6 DIGIT NUMBER]`
   - Example: `IMM-2025-847392`

4. **`src/controllers/organizationController.ts`**
   - `createOrganization` - Create new organization
   - `getMyOrganization` - Get current user's organization
   - `updateMyOrganization` - Update organization profile (org_admin only)
   - `getOrganizationUsers` - List users in organization (org_admin only)
   - `inviteUser` - Invite user to organization (org_admin only)
   - `updateOrganizationUser` - Update user role/status (org_admin only)

5. **`src/routes/organizations.routes.ts`**
   - All routes registered in `app.ts` as `/api/organizations`

### **Role-Based Access Control (RBAC)**

**Roles:**
- `org_admin` - Full organization control
- `professional` - Can manage cases, tasks, documents
- `applicant` - Can only view their own cases

---

## ✅ Phase 2 - Case Management Backend (COMPLETE)

### **Case Management**

**Controller:** `src/controllers/caseController.ts`
- `createCaseHandler` - Create case with auto-generated reference
- `getCases` - List cases with filtering, pagination, role-based access
- `getCaseByIdHandler` - Get single case with full details
- `updateCaseHandler` - Update case (org_admin & professional)
- `deleteCaseHandler` - Soft delete (close case, org_admin only)
- `getCaseStats` - Dashboard statistics

**Routes:** `src/routes/cases.routes.ts`
- `GET /api/cases` - List cases
- `POST /api/cases` - Create case
- `GET /api/cases/stats` - Get statistics
- `GET /api/cases/:id` - Get case by ID
- `PUT /api/cases/:id` - Update case
- `DELETE /api/cases/:id` - Close case

### **Document Management**

**Controller:** `src/controllers/documentController.ts`
- `uploadDocument` - Upload file (multer, 10MB max, PDF/JPG/PNG/DOC/DOCX)
- `getDocumentsByCase` - Get documents for case (grouped by category)
- `updateDocument` - Update document metadata
- `deleteDocument` - Delete document and file
- `getDocumentDownload` - Stream file for download

**Routes:** `src/routes/case-documents.routes.ts`
- `POST /api/case-documents/upload` - Upload document
- `GET /api/case-documents/case/:caseId` - Get documents for case
- `PUT /api/case-documents/:id` - Update document
- `DELETE /api/case-documents/:id` - Delete document
- `GET /api/case-documents/:id/download` - Download document

**File Storage:**
- Path: `uploads/[organizationId]/[caseId]/[timestamp]-[filename]`
- Static serving: `app.use('/uploads', express.static('uploads'))`

### **Task Management**

**Controller:** `src/controllers/taskController.ts`
- `createTask` - Create task (org_admin & professional)
- `getTasksByCase` - Get tasks for case (filterable)
- `updateTask` - Update task (auto-sets completedAt)
- `deleteTask` - Hard delete (org_admin only)
- `getUpcomingDeadlines` - Get tasks due in next 7 days

**Routes:** `src/routes/tasks.routes.ts`
- `POST /api/tasks` - Create task
- `GET /api/tasks/case/:caseId` - Get tasks for case
- `GET /api/tasks/upcoming` - Get upcoming deadlines
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### **Message Management**

**Controller:** `src/controllers/messageController.ts`
- `sendMessage` - Send message (applicants can't send internal)
- `getMessagesByCase` - Get messages for case (with pagination)
- `markMessagesRead` - Mark messages as read
- `getUnreadCount` - Get unread message count

**Routes:** `src/routes/messages.routes.ts`
- `POST /api/messages` - Send message
- `GET /api/messages/case/:caseId` - Get messages for case
- `PUT /api/messages/read` - Mark messages as read
- `GET /api/messages/unread-count` - Get unread count

---

## 🔐 Security Features

- ✅ JWT Authentication on all routes
- ✅ Organization context middleware
- ✅ Role-based access control (org_admin, professional, applicant)
- ✅ Data isolation by organization (automatic via prismaScopes)
- ✅ Audit logging for all actions
- ✅ File upload validation (type & size)
- ✅ Input validation and error handling

---

## 📊 Database Schema Highlights

### **Organization Model**
```prisma
model Organization {
  id, name, slug, plan, planStatus, trialEndsAt
  billingEmail, country, phone, logoUrl, isActive
  users, cases, caseDocuments, tasks, messages, subscriptions, auditLogs
}
```

### **Case Model**
```prisma
model Case {
  id, organizationId, assignedProfessionalId, applicantId
  referenceNumber (unique), status, visaType
  originCountry, destinationCountry, title, notes, priority
  submissionDeadline, submittedAt, decisionAt, outcome
  caseDocuments, tasks, messages, checklists
}
```

### **User Model (Updated)**
```prisma
model User {
  // Existing fields...
  organizationId, phone, avatarUrl, isActive
  // Relations...
  assignedCases, applicantCases, assignedTasks, sentMessages
}
```

---

## 🚀 API Endpoints Summary

### **Organizations**
- `POST /api/organizations` - Create organization
- `GET /api/organizations/me` - Get my organization
- `PUT /api/organizations/me` - Update organization
- `GET /api/organizations/me/users` - List users
- `POST /api/organizations/me/invite` - Invite user
- `PUT /api/organizations/me/users/:userId` - Update user

### **Cases**
- `GET /api/cases` - List cases (with filters & pagination)
- `POST /api/cases` - Create case
- `GET /api/cases/stats` - Get statistics
- `GET /api/cases/:id` - Get case by ID
- `PUT /api/cases/:id` - Update case
- `DELETE /api/cases/:id` - Close case

### **Case Documents**
- `POST /api/case-documents/upload` - Upload document
- `GET /api/case-documents/case/:caseId` - Get documents
- `PUT /api/case-documents/:id` - Update document
- `DELETE /api/case-documents/:id` - Delete document
- `GET /api/case-documents/:id/download` - Download document

### **Tasks**
- `POST /api/tasks` - Create task
- `GET /api/tasks/case/:caseId` - Get tasks for case
- `GET /api/tasks/upcoming` - Get upcoming deadlines
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### **Messages**
- `POST /api/messages` - Send message
- `GET /api/messages/case/:caseId` - Get messages for case
- `PUT /api/messages/read` - Mark messages as read
- `GET /api/messages/unread-count` - Get unread count

---

## 📦 Current State

### **Backend:**
- ✅ Multi-tenant database schema
- ✅ Organization management API
- ✅ Case management API
- ✅ Document upload/download API
- ✅ Task management API
- ✅ Message/communication API
- ✅ Audit logging
- ✅ Role-based access control
- ✅ Deployed on Hetzner (78.46.183.41)

### **Frontend:**
- ⏳ Next.js application (existing)
- ⏳ Needs multi-tenant dashboard implementation
- ⏳ Needs case management UI
- ⏳ Needs document upload UI
- ⏳ Needs task management UI
- ⏳ Needs messaging UI

---

## 🎯 Next Steps - Phase 3

**Phase 3 will implement:**
- Next.js frontend dashboard for multi-tenant case management
- Organization onboarding flow
- Case list and detail views
- Document upload/management UI
- Task management interface
- Messaging/communication UI
- Role-based UI rendering

---

## 📝 Key Files Reference

**Backend:**
- `backend/prisma/schema.prisma` - Database schema
- `backend/src/middleware/organizationContext.ts` - Org context middleware
- `backend/src/helpers/prismaScopes.ts` - Scoped query helpers
- `backend/src/controllers/caseController.ts` - Case management
- `backend/src/controllers/documentController.ts` - Document management
- `backend/src/controllers/taskController.ts` - Task management
- `backend/src/controllers/messageController.ts` - Message management
- `backend/src/app.ts` - Express app with all routes

**Frontend:**
- `app/` - Next.js app directory (to be implemented)

---

**Ready for Phase 3 - Next.js Frontend Dashboard Implementation!** 🚀
