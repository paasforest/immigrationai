# Launch Checklist

## BEFORE YOU DEPLOY — Critical Checks

### Backend Testing

Run through each of these manually before deploying using Postman or Thunder Client:

#### ✅ API Endpoint Verification

- [ ] **POST /api/organizations/complete-onboarding**
  - Creates organization + trial subscription
  - Returns valid organization object
  - Trial subscription has correct end date (14 days from now)

- [ ] **POST /api/cases**
  - Creates case with correct `referenceNumber` format
  - Case belongs to authenticated user's organization
  - Returns case with all required fields

- [ ] **POST /api/case-documents/upload**
  - Stores file to correct folder path (`uploads/{orgId}/{caseId}/`)
  - Creates database record with correct metadata
  - Returns document object with fileUrl

- [ ] **GET /api/cases**
  - Returns only cases belonging to authenticated user's organization
  - Filters work correctly (status, visaType, destination, etc.)
  - Pagination works

- [ ] **GET /api/ai/generate-checklist**
  - Returns valid checklist items array
  - Items have correct structure (name, category, isRequired)
  - **Note**: Costs OpenAI credits — test once only

- [ ] **GET /health**
  - Returns 200 status
  - Returns `{"status":"ok","timestamp":"..."}`

#### ✅ Security Tests

- [ ] **Data Isolation Test**
  - Create two test organizations with different accounts
  - Log in as Org A user
  - Confirm Org A cannot see Org B's cases under any circumstance
  - Try accessing Org B's case ID directly — should return 404
  - **This is your most important security test**

- [ ] **Role Restrictions Test**
  - Log in as an applicant role
  - Try to call `PUT /api/cases/:id` — should return 403 Forbidden
  - Try to call `POST /api/organizations/me/invite` — should return 403
  - Try to call `GET /api/immigration-analytics/overview` — should return 403
  - Confirm applicant can only access their own cases

- [ ] **File Upload Security**
  - Upload a PDF file
  - Confirm it saves to correct folder path: `uploads/{organizationId}/{caseId}/`
  - Confirm file permissions are correct (not world-readable)
  - Test download endpoint: `GET /api/case-documents/:id/download`
  - Confirm download streams file correctly
  - Try downloading another org's document — should return 404

### Frontend Testing

Walk through these flows manually in the browser:

#### ✅ User Flows

- [ ] **Sign Up Flow**
  - Sign up as new user
  - Onboarding wizard appears
  - Complete onboarding (organization name, country, etc.)
  - Dashboard loads after onboarding
  - Trial banner appears with correct end date

- [ ] **Case Management Flow**
  - Create a case from dashboard
  - Case appears in cases list
  - Click through to case detail page
  - All tabs load (Overview, Documents, Tasks, Messages, Checklist)
  - Case reference number displays correctly

- [ ] **Document Upload Flow**
  - Navigate to Documents tab
  - Upload a document (PDF, JPG, PNG)
  - Document appears in documents list
  - Download button works
  - Document status can be updated

- [ ] **Checklist Flow**
  - Navigate to Checklist tab
  - Create new checklist
  - Use AI generation — returns items
  - Mark items as complete
  - Completion percentage updates
  - Document can be linked to checklist item

- [ ] **Messaging Flow**
  - Navigate to Messages tab
  - Send a message
  - Message appears in chat
  - Send an internal message (toggle switch)
  - Log in as applicant — internal message should NOT be visible
  - Applicant can send messages back

- [ ] **Role-Based Access**
  - Log in as applicant role
  - Redirects to `/portal` (not `/dashboard/immigration`)
  - Can see their assigned cases
  - Cannot access `/dashboard/immigration` (redirects or 403)
  - Cannot see admin/analytics pages

#### ✅ Mobile Responsiveness

Test on an actual phone (not just browser dev tools):

- [ ] **Sidebar Drawer**
  - Opens/closes correctly on mobile
  - Navigation links work
  - User menu accessible

- [ ] **Case Table**
  - Columns stack or scroll horizontally
  - Filters accessible
  - Click to view case works

- [ ] **Messages Chat**
  - Chat interface fits screen
  - Input field accessible
  - Messages scroll correctly
  - Send button works

- [ ] **Document Upload**
  - File picker works on mobile
  - Upload progress visible
  - Document list scrolls

---

## DEPLOYMENT ORDER

Do these in this exact sequence:

### 1. Database Setup
- [ ] Set up PostgreSQL on Hetzner (or configure Supabase)
- [ ] Run migrations: `npx prisma migrate deploy`
- [ ] Verify database connection
- [ ] Test a simple query

### 2. Backend Deployment
- [ ] Deploy backend code to Hetzner VPS
- [ ] Install dependencies: `npm install --production`
- [ ] Build TypeScript: `npm run build`
- [ ] Start with PM2: `pm2 start ecosystem.config.js`
- [ ] Confirm `/health` endpoint responds: `curl http://localhost:4000/health`
- [ ] Save PM2 config: `pm2 save`
- [ ] Enable PM2 startup: `pm2 startup` (follow instructions)

### 3. Environment Variables
- [ ] Set all environment variables in `backend/.env`
- [ ] **Double check these critical ones:**
  - `OPENAI_API_KEY` — valid and has credits
  - `JWT_SECRET` — strong (32+ characters)
  - `JWT_REFRESH_SECRET` — strong (32+ characters)
  - `FRONTEND_URL` — exact production URL (e.g., `https://immigrationai.co.za`)
  - `DATABASE_URL` — correct connection string
  - `RESEND_API_KEY` — valid for sending emails
- [ ] Restart PM2: `pm2 restart immigration-backend`

### 4. Frontend Deployment
- [ ] Deploy frontend to Vercel
- [ ] Set `NEXT_PUBLIC_API_URL` to your backend domain (e.g., `https://api.immigrationai.co.za`)
- [ ] Set other environment variables in Vercel dashboard
- [ ] Wait for build to complete
- [ ] Verify deployment succeeded

### 5. End-to-End Testing
- [ ] Test full signup flow on live URL
- [ ] Create a test case
- [ ] Upload a test document
- [ ] Send a test message
- [ ] Verify emails are sending (check Resend dashboard)

### 6. SSL Setup
- [ ] Set up SSL on backend domain using certbot
- [ ] Run: `sudo certbot --nginx -d api.immigrationai.co.za`
- [ ] Verify HTTPS works: `curl https://api.immigrationai.co.za/health`
- [ ] Test auto-renewal: `sudo certbot renew --dry-run`

### 7. Nginx Configuration
- [ ] Configure Nginx with rate limiting headers
- [ ] Set `client_max_body_size 10M` for file uploads
- [ ] Add security headers (X-Frame-Options, etc.)
- [ ] Test Nginx config: `sudo nginx -t`
- [ ] Reload Nginx: `sudo systemctl reload nginx`

### 8. Log Management
- [ ] Set up PM2 log rotation
- [ ] Configure log retention (keep last 7 days)
- [ ] Verify logs directory has write permissions
- [ ] Test log rotation works

---

## THINGS MOST LIKELY TO BREAK IN PRODUCTION

### ⚠️ File Uploads

**Issue**: Multer saves to local `uploads/` folder. On Vercel this won't persist, but backend is on Hetzner so this is fine.

**Check**:
```bash
# On Hetzner server
mkdir -p /var/www/immigrationai/backend/uploads
chmod 755 /var/www/immigrationai/backend/uploads
chown -R $USER:$USER /var/www/immigrationai/backend/uploads
```

**Verify**:
- [ ] Uploads folder exists
- [ ] Write permissions are correct
- [ ] Files save to correct path: `uploads/{organizationId}/{caseId}/`
- [ ] Download endpoint can read files

### ⚠️ CORS Configuration

**Issue**: Backend must explicitly allow Vercel frontend URL.

**Check** in `backend/src/app.ts`:
```typescript
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  // Add exact production URL
  'https://immigrationai.co.za',
];
```

**Verify**:
- [ ] CORS allows production frontend URL
- [ ] Not just `localhost:3000`
- [ ] Test from browser console: fetch requests work

### ⚠️ JWT Secrets

**Issue**: If `JWT_SECRET` in production differs from development, all existing tokens become invalid.

**Action**:
- [ ] Use strong, unique secrets in production
- [ ] Document that users will need to re-login after deployment
- [ ] This is fine for launch (no existing users)

### ⚠️ OpenAI Rate Limits

**Issue**: Multiple professionals using AI features simultaneously may hit rate limits.

**Protection**: The `aiLimiter` middleware (20 requests/hour/user) protects against this.

**Verify**:
- [ ] Rate limiter is active in production
- [ ] Test with multiple concurrent requests
- [ ] Confirm 429 responses when limit exceeded

### ⚠️ Trial Expiry Scheduler

**Issue**: PM2 process must keep running setInterval schedulers.

**Check**:
- [ ] Schedulers are in `app.ts` (run in process memory)
- [ ] PM2 keeps process alive
- [ ] Test: Create trial org, wait, verify expiry email sends

**Verify**:
- [ ] PM2 process stays running
- [ ] Schedulers execute (check logs)
- [ ] Trial expiry emails send correctly

---

## Pre-Launch Final Checks

- [ ] All backend tests pass
- [ ] All frontend flows work
- [ ] Mobile responsive on real devices
- [ ] Security tests pass (data isolation, role restrictions)
- [ ] File uploads work end-to-end
- [ ] Environment variables set correctly
- [ ] SSL certificates installed
- [ ] Nginx configured with rate limiting
- [ ] PM2 log rotation configured
- [ ] Health endpoint responds
- [ ] Database migrations applied
- [ ] Backup strategy in place

---

## Launch Day Checklist

- [ ] Deploy backend (follow deployment order above)
- [ ] Deploy frontend
- [ ] Test signup flow on production
- [ ] Test case creation on production
- [ ] Test document upload on production
- [ ] Test AI checklist generation (once)
- [ ] Monitor PM2 logs: `pm2 logs immigration-backend`
- [ ] Monitor Vercel deployment logs
- [ ] Check error tracking (if implemented)
- [ ] Verify emails are sending
- [ ] Test from different network (not your own)

---

## Post-Launch Monitoring (First 24 Hours)

- [ ] Monitor PM2 process status hourly
- [ ] Check error logs for any 500 errors
- [ ] Monitor database connection pool
- [ ] Check file upload success rate
- [ ] Monitor OpenAI API usage
- [ ] Check email delivery rates
- [ ] Monitor response times
- [ ] Check for any CORS errors in browser console

---

## Emergency Rollback Plan

If critical issues arise:

1. **Frontend Rollback**:
   - In Vercel dashboard, revert to previous deployment
   - Takes ~2 minutes

2. **Backend Rollback**:
   ```bash
   cd /var/www/immigrationai
   git checkout <previous-commit>
   cd backend
   npm install --production
   npm run build
   pm2 restart immigration-backend
   ```

3. **Database Rollback**:
   ```bash
   # Only if migrations broke something
   npx prisma migrate resolve --rolled-back <migration-name>
   ```

---

**Status**: ⬜ Not Started | 🟡 In Progress | ✅ Complete

**Last Updated**: [Date]
