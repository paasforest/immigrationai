# Marketplace Testing Guide

This guide provides step-by-step test scenarios for the marketplace intake and routing system.

## Prerequisites

- Backend running on `http://localhost:4000`
- Frontend running on `http://localhost:3000`
- Database with migrations applied
- At least 2 test user accounts (one professional, one admin)
- Services seeded: `npm run seed:services` in backend directory

---

## SCENARIO 1: Full Intake to Case Conversion

### Step 1: Get Services
```bash
curl http://localhost:4000/api/intake/services
```
**Expected:** Returns array of 8 services with `id`, `name`, `slug`, `caseType`, etc.

### Step 2: Submit Intake
```bash
curl -X POST http://localhost:4000/api/intake/submit \
  -H "Content-Type: application/json" \
  -d '{
    "serviceId": "<service-id-from-step-1>",
    "applicantName": "Test Applicant",
    "applicantEmail": "test@example.com",
    "applicantPhone": "+2348012345678",
    "applicantCountry": "Nigeria",
    "destinationCountry": "United Kingdom",
    "urgencyLevel": "normal",
    "description": "I need help with a UK student visa application. I have been accepted to a university and need guidance on the visa process."
  }'
```
**Expected:** 
- Status 200
- Response: `{ "success": true, "data": { "referenceNumber": "INT-2025-XXXXXX" } }`
- Reference number format: `INT-YYYY-XXXXXX`

### Step 3: Check Status (Immediate)
```bash
curl "http://localhost:4000/api/intake/status/INT-2025-XXXXXX?email=test@example.com"
```
**Expected:** Status `pending_assignment`

### Step 4: Wait for Routing (2-5 seconds)
The routing engine runs asynchronously. Wait a few seconds, then check status again.

**Expected:** Status changes to `assigned` (if professional is available)

### Step 5: Professional Views Lead
```bash
curl http://localhost:4000/api/intake/my-leads \
  -H "Authorization: Bearer <professional-jwt-token>"
```
**Expected:** 
- Lead appears in response
- Status: `pending`
- Includes `intake` with full details
- `expiresAt` is 48 hours from `assignedAt`

### Step 6: Professional Accepts Lead
```bash
curl -X POST http://localhost:4000/api/intake/respond \
  -H "Authorization: Bearer <professional-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "assignmentId": "<assignment-id-from-step-5>",
    "action": "accept"
  }'
```
**Expected:**
- Status 200
- Response includes `case` object with `id`, `referenceNumber`
- Assignment status becomes `accepted`
- Intake status becomes `converted`

### Step 7: Verify Case Created
```bash
curl http://localhost:4000/api/cases/<case-id> \
  -H "Authorization: Bearer <professional-jwt-token>"
```
**Expected:** Case exists with:
- `referenceNumber` (different from intake reference)
- `applicantId` matches created/found applicant user
- `assignedProfessionalId` matches accepting professional
- `status`: `open`

---

## SCENARIO 2: Decline and Reassignment

### Step 1: Submit Intake
Same as Scenario 1, Step 2.

### Step 2: Professional 1 Declines
```bash
curl -X POST http://localhost:4000/api/intake/respond \
  -H "Authorization: Bearer <professional1-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "assignmentId": "<assignment-id>",
    "action": "decline",
    "declinedReason": "Outside my specialization"
  }'
```
**Expected:**
- Status 200
- Assignment status: `declined`
- Routing engine automatically assigns to next professional

### Step 3: Check Intake Status
```bash
curl "http://localhost:4000/api/intake/status/INT-2025-XXXXXX?email=test@example.com"
```
**Expected:** Status remains `assigned` (new assignment created)

### Step 4: Professional 2 Views Lead
```bash
curl http://localhost:4000/api/intake/my-leads \
  -H "Authorization: Bearer <professional2-jwt-token>"
```
**Expected:** Lead appears with `attemptNumber: 2`

### Step 5: Professional 2 Accepts
Same as Scenario 1, Step 6.

**Expected:** Case created successfully

---

## SCENARIO 3: No Match Found

### Step 1: Submit Intake for Service with No Professionals
Submit an intake for a service where:
- No professionals have specializations configured
- OR all professionals have `isAcceptingLeads: false`
- OR all professionals have full `maxConcurrentLeads`

### Step 2: Wait for Routing (5-10 seconds)

### Step 3: Check Status
```bash
curl "http://localhost:4000/api/intake/status/INT-2025-XXXXXX?email=test@example.com"
```
**Expected:** Status `no_match_found`

---

## SCENARIO 4: Professional Setup

### Step 1: Get Services
```bash
curl http://localhost:4000/api/intake/services
```

### Step 2: Create Specialization
```bash
curl -X POST http://localhost:4000/api/intake/specializations \
  -H "Authorization: Bearer <professional-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "serviceId": "<service-id>",
    "originCorridors": ["Nigeria", "Ghana"],
    "destinationCorridors": ["United Kingdom", "Canada"],
    "maxConcurrentLeads": 10,
    "yearsExperience": 5,
    "bio": "I specialize in UK and Canadian visas",
    "isAcceptingLeads": true
  }'
```
**Expected:** 
- Status 200
- Returns specialization with `id`, `service`, etc.

### Step 3: Get My Specializations
```bash
curl http://localhost:4000/api/intake/specializations \
  -H "Authorization: Bearer <professional-jwt-token>"
```
**Expected:** Returns array with the specialization from Step 2

### Step 4: Create Public Profile
```bash
curl -X POST http://localhost:4000/api/intake/profile \
  -H "Authorization: Bearer <professional-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "displayName": "John Doe",
    "title": "Immigration Lawyer",
    "bio": "Experienced immigration professional",
    "languages": ["English", "Yoruba"],
    "isPublic": true,
    "locationCity": "Lagos",
    "locationCountry": "Nigeria"
  }'
```
**Expected:** Status 200, returns profile

### Step 5: Check Public Directory
```bash
curl "http://localhost:4000/api/intake/directory?page=1&limit=12"
```
**Expected:** 
- Profile appears in results (if `isPublic: true`)
- Includes `services`, `corridors`, `isAcceptingLeads`

---

## SCENARIO 5: Verification Flow

### Step 1: Professional Uploads Verification Doc
Update profile with `verificationDoc` URL:
```bash
# This would typically be done via file upload endpoint
# For testing, manually update in database or via admin
```

### Step 2: Admin Views Pending Verifications
```bash
curl http://localhost:4000/api/intake/admin/verifications \
  -H "Authorization: Bearer <admin-jwt-token>"
```
**Expected:** 
- Returns profiles with `verificationDoc` not null
- `isVerified: false`
- Includes `user` and `organization` data

### Step 3: Admin Approves
```bash
curl -X POST http://localhost:4000/api/intake/admin/verify \
  -H "Authorization: Bearer <admin-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "profileId": "<profile-id>",
    "action": "approve"
  }'
```
**Expected:**
- Status 200
- Profile `isVerified: true`
- Email sent to professional

### Step 4: Verify Profile Updated
```bash
curl http://localhost:4000/api/intake/profile \
  -H "Authorization: Bearer <professional-jwt-token>"
```
**Expected:** `isVerified: true`

---

## SCENARIO 6: Public Directory and Profile

### Step 1: Get Directory (No Filters)
```bash
curl "http://localhost:4000/api/intake/directory?page=1&limit=12"
```
**Expected:** Returns paginated list of public profiles

### Step 2: Filter by Service
```bash
curl "http://localhost:4000/api/intake/directory?service=visa_application&page=1&limit=12"
```
**Expected:** Only profiles with matching service specialization

### Step 3: Filter by Origin Country
```bash
curl "http://localhost:4000/api/intake/directory?originCountry=Nigeria&page=1&limit=12"
```
**Expected:** Only profiles accepting leads from Nigeria

### Step 4: Get Public Profile
```bash
curl http://localhost:4000/api/intake/directory/<userId>
```
**Expected:** 
- Full profile details
- Specializations with services
- No email or private data exposed

---

## SCENARIO 7: Lead Analytics

### Step 1: Get My Lead Stats
```bash
curl http://localhost:4000/api/intake/my-stats \
  -H "Authorization: Bearer <professional-jwt-token>"
```
**Expected:** Returns:
- `totalLeadsReceived`, `totalAccepted`, `totalDeclined`
- `acceptanceRate` (percentage)
- `leadsThisMonth`, `acceptedThisMonth`
- `avgResponseHours`
- `topServiceTypes`, `topOriginCountries`, `topDestinations`
- `leadsByMonth` (last 6 months)

---

## SCENARIO 8: Admin Marketplace Stats

### Step 1: Get Routing Stats
```bash
curl http://localhost:4000/api/intake/admin/routing-stats \
  -H "Authorization: Bearer <admin-jwt-token>"
```
**Expected:** Returns:
- `totalIntakes`, `intakesThisMonth`
- `successfullyMatched`, `noMatchFound`, `declinedAll`
- `averageMatchAttempts`, `averageResponseHours`
- `topServices`, `topCorridors`
- `totalActiveProfessionals`

### Step 2: Get All Intakes
```bash
curl "http://localhost:4000/api/intake/admin/all-intakes?page=1&limit=20" \
  -H "Authorization: Bearer <admin-jwt-token>"
```
**Expected:** Returns all intakes with filters and pagination

---

## Common Errors and Debugging

### Error: "Service not found or inactive"
- **Cause:** Service ID doesn't exist or `isActive: false`
- **Fix:** Run `npm run seed:services` or check service ID

### Error: "No matching professionals"
- **Cause:** No professionals configured for the service/corridor
- **Fix:** Create specialization for a professional matching the intake criteria

### Error: "Assignment expired"
- **Cause:** Professional didn't respond within 48 hours
- **Fix:** System should auto-reassign, or manually reassign via admin

### Error: "Access denied" on admin routes
- **Cause:** User role is not `admin`
- **Fix:** Update user role in database: `UPDATE users SET role = 'admin' WHERE email = '...'`

### Routing Not Working
- **Check:** Backend logs for routing errors
- **Verify:** `setImmediate` is calling `assignIntake` correctly
- **Test:** Manually call `assignIntake(intakeId)` from routing engine

### Email Not Sending
- **Check:** `RESEND_API_KEY` is set in `.env`
- **Check:** Backend logs for email errors
- **Note:** Email failures should NOT block API responses

---

## Frontend Testing

### Test Public Pages (No Auth)
1. Navigate to `/get-help` - should show service grid
2. Click a service - should show intake form
3. Fill and submit form - should redirect to confirmation
4. Navigate to `/find-a-specialist` - should show directory
5. Filter by service/origin/destination - should filter results
6. Click a professional - should show profile page
7. Click "Request This Specialist" - should navigate to intake with `?preferredSpecialist=...`

### Test Professional Pages (Auth Required)
1. Login as professional
2. Navigate to `/dashboard/immigration/leads` - should show lead inbox
3. Accept a lead - should create case and redirect
4. Navigate to `/dashboard/immigration/leads/analytics` - should show stats
5. Navigate to `/dashboard/immigration/profile` - should show profile/specialization setup

### Test Admin Pages (Admin Auth Required)
1. Login as admin
2. Navigate to `/admin/verifications` - should show pending verifications
3. Approve/reject a verification - should update status and send email
4. Navigate to `/admin/marketplace` - should show routing stats

---

## Performance Testing

### Load Test: Multiple Intakes
Submit 10 intakes simultaneously and verify:
- All get unique reference numbers
- Routing doesn't block responses
- No duplicate assignments

### Load Test: Directory Filtering
Test directory with 100+ profiles:
- Filter by service
- Filter by origin country
- Filter by destination
- Verify pagination works correctly

---

## Security Testing

### Test: Public Routes
- Verify `/api/intake/submit` works without auth
- Verify `/api/intake/directory` works without auth
- Verify no sensitive data exposed in public responses

### Test: Protected Routes
- Verify `/api/intake/my-leads` requires auth
- Verify `/api/intake/respond` requires auth
- Verify admin routes require `admin` role

### Test: Data Isolation
- Professional A should only see their own leads
- Professional B should not see Professional A's leads
- Admin can see all intakes

---

## Notes

- Routing runs asynchronously using `setImmediate()` - allow 2-5 seconds for assignment
- Email sending is non-blocking - failures logged but don't affect API responses
- Reference numbers are generated client-side for immediate response
- All timestamps are in UTC
- Pagination is 1-indexed (page 1, 2, 3...)
