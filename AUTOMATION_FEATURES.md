# Automation Features in ImmigrationAI Platform

This document lists all automated processes, scheduled tasks, and background workers in the system.

## 🔄 Scheduled Tasks (Cron Jobs)

### 1. Task Deadline Notifications
- **Frequency:** Every 1 hour
- **Location:** `backend/src/app.ts` → `checkTaskDeadlines()`
- **What it does:**
  - Scans all tasks due in the next 24 hours
  - Creates in-app notifications for assigned users
  - Prevents duplicate notifications (checks if notification was created in last hour)
- **Triggers:** In-app notification creation

### 2. Trial Expiration Warnings
- **Frequency:** Every 6 hours
- **Location:** `backend/src/app.ts` → `checkTrialExpirations()`
- **What it does:**
  - Checks for organizations with trials ending in 7 days → sends warning email
  - Checks for organizations with trials ending in 1 day → sends urgent warning email
  - Marks emails as sent to prevent duplicates
- **Triggers:** Email notifications to org admins

### 3. Expired Lead Assignment Reassignment
- **Frequency:** Every 2 hours
- **Location:** `backend/src/app.ts` → `checkExpiredLeadAssignments()`
- **What it does:**
  - Finds assignments with `status: 'pending'` and `expiresAt < now` (48h passed without response)
  - Marks those assignments as `expired`
  - Calls `reassignIntake()` to route to next matching professional
  - Sends email notification to new professional
- **Triggers:** Automatic reassignment so leads don't get stuck

### 4. Visa Rules Monitor
- **Frequency:** Every 7 days (168 hours)
- **Location:** `backend/src/services/visaRulesMonitor.ts` → `runVisaRulesMonitor()`
- **What it does:**
  - Fetches all official source URLs from active immigration routes
  - Compares SHA-256 hash of page content against stored hash
  - If content changed → uses GPT-4o-mini to summarize changes
  - Creates `RequirementUpdateAlert` in database
  - Emails admin with change summary
- **Cost:** ~USD 0.05–0.20 per week (only calls GPT when content changes)
- **Manual trigger:** `POST /api/admin/visa-rules/run-monitor` (admin only)

---

## 🚀 Event-Driven Automation

### 5. Lead Intake → Professional Routing
- **Trigger:** When a new intake is submitted (`POST /api/intake`)
- **Location:** `backend/src/services/routingEngine.ts` → `assignIntake()`
- **What it does:**
  - Finds matching professionals based on:
    - Service type (visa application, work permit, etc.)
    - Origin/destination corridors
    - Professional's current lead load
    - Success rate (if available)
    - Subscription tier (Agency gets priority)
  - Creates `IntakeAssignment` record
  - Sends email notification to matched professional
  - Sets 48-hour expiration on assignment
- **Tier Limits:**
  - Starter: 5 leads/month
  - Professional: 20 leads/month
  - Agency: Unlimited

### 6. Lead Acceptance → Case Creation
- **Trigger:** When professional accepts a lead (`POST /api/intake/:id/respond`)
- **Location:** `backend/src/services/routingEngine.ts` → `convertIntakeToCase()`
- **What it does:**
  - Creates new `Case` record
  - Auto-creates or updates `User` with role `applicant`
  - Generates password reset token for new clients
  - Sends welcome email with portal access link
  - Updates intake status to `converted`
  - **Auto-generates smart checklist** (see #6)

### 7. Smart Checklist Auto-Generation
- **Trigger:** When case is created from accepted lead
- **Location:** `backend/src/services/routingEngine.ts` → `convertIntakeToCase()` (lines 574-684)
- **What it does:**
  - Always creates 4 core documents:
    1. Valid passport (all pages)
    2. Completed visa application form
    3. Recent passport-size photographs
    4. Proof of travel insurance (if required)
  - If risk profile exists from intake:
    - Adds AI-flagged document hints from high/medium risk factors
    - Includes tool-specific recommendations (home ties, credential evaluation, etc.)
  - Creates `DocumentChecklist` and `ChecklistItem` records

### 8. Client Account Auto-Creation
- **Trigger:** When professional accepts a lead
- **Location:** `backend/src/services/routingEngine.ts` → `convertIntakeToCase()` (lines 489-543)
- **What it does:**
  - Checks if user exists by email
  - If new: Creates user with `role: 'applicant'`
  - Generates 48-hour password setup token
  - Links user to professional's organization (for portal API access)
  - Sends welcome email with password setup link
  - If existing: Updates to `applicant` role if needed

### 9. Lead Re-Routing
- **Trigger:** When professional declines a lead or assignment expires
- **Location:** `backend/src/services/routingEngine.ts` → `reassignIntake()`
- **What it does:**
  - Finds next best matching professional (excludes already-tried professionals)
  - Creates new assignment with incremented attempt number
  - Maximum 5 attempts before marking as `declined_all`
  - Sends email notification to new professional

### 10. Eligibility Scoring (Silent)
- **Trigger:** When intake is submitted
- **Location:** Background processing (likely in intake controller)
- **What it does:**
  - Silently scores lead eligibility against visa rules
  - Generates risk profile with factor-level assessment
  - Stores results in `intake.additionalData.riskProfile`
  - Used later for smart checklist generation

### 11. Email Notifications (Various Triggers)
- **Document Upload:** When client uploads document → notifies assigned professional
- **Case Update:** When case status changes → notifies client
- **Embassy Package Ready:** When professional sends embassy package → notifies client
- **Lead Assignment:** When lead is routed → notifies professional
- **Lead Acceptance:** When professional accepts → notifies client
- **Message Sent:** When message is sent in case → notifies recipient
- **Location:** Various controllers call `emailService` functions

### 12. Professional Specialization Auto-Creation
- **Trigger:** When professional completes onboarding
- **Location:** `backend/src/controllers/organizationController.ts` → `completeOnboarding()`
- **What it does:**
  - Creates `ProfessionalSpecialization` records for selected services
  - Sets default corridors (empty = accept all)
  - Sets `isAcceptingLeads: true` by default
  - Makes professional immediately visible to routing engine

### 13. Trial Expiry Enforcement
- **Trigger:** On every API request (middleware check)
- **Location:** `backend/src/middleware/organizationContext.ts`
- **What it does:**
  - Checks if `trialEndsAt` is in the past
  - Sets `planStatus: 'expired'` if trial expired
  - Blocks access to dashboard (returns `402 TRIAL_EXPIRED`)
  - Allows access to billing routes (via `organizationContextAllowExpired`)

### 14. Lead Usage Tracking
- **Trigger:** When lead is assigned to professional
- **Location:** `backend/src/services/routingEngine.ts` → `assignIntake()`
- **What it does:**
  - Creates `IntakeAssignment` record (counted toward monthly limit)
  - Enforced in `findMatchingProfessionals()` — filters out professionals who hit their tier limit
  - Resets monthly on 1st of each month

---

## 📊 Summary

**Scheduled Tasks:** 4 (hourly, 6-hourly, 2-hourly, weekly)
**Event-Driven Automation:** 10+ processes
**Total Automation Points:** 14+ automated workflows

All automation is logged and most failures are non-blocking (won't break the main flow).
