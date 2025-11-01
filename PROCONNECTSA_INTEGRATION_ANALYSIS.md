# ProConnectSA ↔ ImmigrationAI Integration Analysis

**Created:** November 1, 2025  
**Purpose:** Integration guide for funneling ProConnectSA visitors to ImmigrationAI platform

---

## 📊 PLATFORM ANALYSIS

### 1. ImmigrationAI Project Structure

```
immigration_ai/
├── Frontend (Next.js 13.5.1)
│   ├── app/                     # Main Next.js app directory
│   │   ├── auth/                # Authentication pages
│   │   │   ├── login/          # Login page
│   │   │   └── signup/         # Signup page
│   │   ├── dashboard/          # Main user dashboard
│   │   ├── documents/          # AI document generators
│   │   │   ├── sop/           # SOP Generator ⭐
│   │   │   ├── ai-chat/       # AI Chat Assistant
│   │   │   ├── visa-checker/  # Visa Eligibility Checker
│   │   │   ├── mock-interview/ # Interview Practice
│   │   │   └── [15+ other tools]
│   │   ├── pricing/           # Pricing plans
│   │   ├── payment/           # Payment processing
│   │   └── page.tsx           # Landing page
│   ├── components/            # 47+ UI components
│   ├── contexts/              # Auth & Subscription state
│   └── lib/api/               # API client functions
│
├── Backend (Node.js + Express + TypeScript)
│   ├── src/
│   │   ├── routes/            # 14 route modules
│   │   │   ├── auth.routes.ts
│   │   │   ├── ai.routes.ts   # AI endpoints
│   │   │   ├── billing.routes.ts
│   │   │   ├── admin.routes.ts
│   │   │   └── [10+ other routes]
│   │   ├── controllers/       # 10+ controllers
│   │   ├── middleware/        # Auth, rate limiting
│   │   ├── services/          # 17+ services
│   │   └── config/            # DB, Prisma config
│   └── prisma/
│       └── schema.prisma      # Database schema
│
├── Storage (Supabase)
│   ├── PostgreSQL Database
│   └── File Storage Buckets
│
└── Separate Landing Page (Vite + React)
    └── immigrationai_landing_page/
        ├── src/components/
        │   ├── LeadCapture.tsx  # ⭐ Email capture
        │   ├── Hero.tsx
        │   ├── Pricing.tsx
        │   └── [11 components]
```

---

## 🛠️ TECHNOLOGY STACK

### Frontend
- **Framework:** Next.js 13.5.1 (React 18)
- **UI Library:** Radix UI + Tailwind CSS
- **State Management:** React Context API
- **Forms:** React Hook Form + Zod validation
- **Icons:** Lucide React
- **Charts:** Recharts
- **PDF Generation:** jsPDF + html2canvas

### Backend
- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js
- **ORM:** Prisma 6.17
- **Database:** PostgreSQL (via Supabase)
- **File Storage:** Supabase Storage
- **Authentication:** JWT + Refresh Tokens
- **AI:** OpenAI GPT-4 (gpt-4o-mini)
- **Payment:** Manual Bank Transfer (PayFast coming)
- **Security:** Helmet.js, CORS, Rate Limiting
- **Logging:** Winston

### Infrastructure
- **Frontend Hosting:** Vercel
- **Backend Hosting:** Hetzner VPS (€5/month)
- **Database/Storage:** Supabase (Free tier)
- **Domain:** immigrationai.co.za
- **CDN:** Vercel Edge Network

---

## 🔗 API ENDPOINTS

### Public Endpoints (No Auth Required)
```
POST   /api/auth/signup          # Create account
POST   /api/auth/login           # Login
POST   /api/auth/refresh         # Refresh JWT token
POST   /api/auth/reset-password  # Password reset
GET    /health                   # Health check
GET    /api/health               # API health check
```

### Protected Endpoints (Auth Required)
```
# Authentication
GET    /api/auth/user            # Get current user
POST   /api/auth/logout          # Logout

# AI Document Generation
POST   /api/ai/generate-sop      # Generate SOP
POST   /api/ai/analyze-sop       # Review/score SOP
POST   /api/ai/chat              # AI chat (optional auth)
POST   /api/ai/check-eligibility # Visa eligibility check
POST   /api/ai/generate-email    # Email templates
POST   /api/ai/generate-support-letter
POST   /api/ai/format-travel-history
POST   /api/ai/generate-financial-letter
POST   /api/ai/generate-purpose-of-visit

# Interview Coach
POST   /api/interview-coach/start-session
GET    /api/interview-coach/questions
POST   /api/interview-coach/submit-response
GET    /api/interview-coach/history

# Documents Management
GET    /api/documents            # List documents
POST   /api/documents            # Create document
GET    /api/documents/:id        # Get document
PUT    /api/documents/:id        # Update document
DELETE /api/documents/:id        # Delete document

# Billing & Usage
GET    /api/billing/usage        # Usage statistics
GET    /api/billing/plans        # Available plans
POST   /api/payments/create      # Create payment
GET    /api/payments/status      # Check payment status
POST   /api/upload/payment-proof # Upload proof

# Admin (Admin Role Required)
GET    /api/admin/payments/pending
PUT    /api/admin/payments/:id/verify
GET    /api/admin/analytics
GET    /api/admin/users

# Checklists
GET    /api/checklists           # Get checklists
POST   /api/checklists           # Create checklist
PUT    /api/checklists/:id       # Update checklist

# Feedback & Analytics
POST   /api/feedback             # Submit feedback
GET    /api/analytics/overview   # Analytics dashboard
GET    /api/analytics/revenue    # Revenue stats

# Team Management
GET    /api/team/members
POST   /api/team/invite
```

---

## 🔐 AUTHENTICATION FLOW

```
User → ProConnectSA → ImmigrationAI

1. User visits ProConnectSA
2. Clicks CTA button/link
3. Redirects to ImmigrationAI
4. ImmigrationAI Landing Page (/)
   ├── "Get Started" button → /auth/signup
   ├── "Login" button → /auth/login
   └── "View Pricing" → /pricing

5. Signup Flow:
   POST /api/auth/signup
   {
     email: "user@example.com",
     password: "SecurePassword123",
     fullName: "John Doe"
   }
   Response:
   {
     success: true,
     token: "eyJhbGciOiJIUzI1NiIs...",
     refreshToken: "abc123...",
     user: { id, email, fullName, subscriptionPlan }
   }

6. Auto-redirect to Dashboard (/dashboard)

7. User starts using AI features:
   - Select feature from dashboard
   - Fill form
   - Click "Generate"
   - Document created in real-time
   - Save/Download options

8. Plan Enforcement:
   - Starter: 3 documents/month
   - Entry: 5 documents/month
   - Professional: Unlimited
   - Enterprise: Unlimited + priority
```

---

## 💾 DATA STORAGE

### Database Schema (PostgreSQL via Prisma)

**Core Tables:**
- `users` - User accounts, subscription plans, roles
- `documents` - Generated SOPs, letters, etc.
- `api_usage` - OpenAI token usage tracking
- `subscriptions` - Subscription history
- `payments` - Payment records
- `payment_proofs` - Uploaded proof files
- `checklists` - Visa requirement checklists
- `feedback` - User feedback
- `application_outcomes` - Success tracking

**Interview Coach Tables:**
- `mock_interviews` - Interview sessions
- `interview_sessions` - Session details
- `interview_questions` - Question database
- `interview_progress` - User progress

**File Storage (Supabase):**
- `payment-proofs` bucket - Payment screenshots
- `documents` bucket - Generated PDFs
- `user-uploads` bucket - Profile images

---

## 📄 PUBLIC PAGES (No Auth Required)

### Landing Pages
1. **`/` (Homepage)**
   - Hero section
   - Features showcase
   - Pricing tiers
   - Testimonials
   - FAQ
   - CTAs: "Get Started", "View Pricing"

2. **`/pricing`**
   - All subscription plans
   - Money-back guarantee
   - Feature comparison
   - CTA: "Get Started" (all tiers)

### Auth Pages
3. **`/auth/signup`**
   - Registration form
   - Email + Password + Name
   - Terms acceptance
   - Already have account? → /auth/login

4. **`/auth/login`**
   - Login form
   - Remember me option
   - Forgot password link
   - Don't have account? → /auth/signup

### Protected Pages (Auth Required)
5. **`/dashboard`** ⭐ MAIN HUB
   - Feature cards (20+ tools)
   - Usage statistics
   - Recent documents
   - Account number display
   - Upgrade prompts

6. **`/documents/*`** (15+ tools)
   - SOP Generator
   - AI Chat
   - Visa Checker
   - Mock Interview
   - English Test Practice
   - And more...

---

## 🎯 LEAD CAPTURE OPPORTUNITIES

### Current Lead Capture Points
1. **Landing Page CTAs** - "Get Started" buttons
2. **Pricing Page** - "Get Started" for each tier
3. **FAQ Section** - "Still have questions? Get Started"
4. **Footer** - "Start your journey today"

### Lead Data Captured
```
Signup Form:
├── Email address
├── Password (hashed)
├── Full Name
├── Subscription Plan (default: "starter")
└── Timestamp

Optional Additional Data:
├── Current Country (via form)
├── Target Country (via form)
├── Visa Type (via form)
└── Purpose (Study/Work/Immigration)
```

---

## 🚀 INTEGRATION OPTIONS FOR PROCONNECTSA

### **OPTION 1: Simple Button Redirect** ⭐ RECOMMENDED
**Best for:** Quick implementation, maximum control

**Implementation:**
```html
<!-- On ProConnectSA website -->
<a href="https://immigrationai.co.za/auth/signup?source=proconnectsa&promo=SAVE20" 
   class="cta-button">
   🚀 Start Your Immigration Journey
</a>
```

**Pros:**
- ✅ 5-minute setup
- ✅ No technical dependencies
- ✅ Full visitor attribution
- ✅ Easy to track conversions
- ✅ Works on any platform
- ✅ Can add UTM parameters

**Cons:**
- ❌ Takes users away from ProConnectSA
- ❌ No embedded preview

**Tracking Setup:**
```javascript
// On ImmigrationAI landing page
const urlParams = new URLSearchParams(window.location.search);
const source = urlParams.get('source'); // "proconnectsa"
const promo = urlParams.get('promo');    // "SAVE20"

// Store in database or analytics
if (source === 'proconnectsa') {
  // Add 20% discount or special badge
  // Track in analytics
}
```

---

### **OPTION 2: Embedded Widget/IFrame**
**Best for:** Keep users on ProConnectSA longer

**Implementation:**
```html
<!-- On ProConnectSA website -->
<iframe 
  src="https://immigrationai.co.za/widget/landing?source=proconnectsa" 
  width="100%" 
  height="800px" 
  frameborder="0"
  style="border-radius: 12px;">
</iframe>
```

**Pros:**
- ✅ Users stay on ProConnectSA
- ✅ Seamless experience
- ✅ No new tab confusion

**Cons:**
- ⚠️ Requires special widget page
- ⚠️ Mobile responsiveness challenges
- ⚠️ CORS configuration needed
- ⚠️ Additional development time

---

### **OPTION 3: Embedded Form** ⭐ MIDDLE GROUND
**Best for:** Quick capture without leaving

**Implementation:**
```html
<!-- On ProConnectSA website -->
<div class="immigrationai-widget">
  <h3>Get Your Free Visa Eligibility Report</h3>
  <form id="immigrationai-capture" 
        action="https://immigrationai.co.za/api/capture-lead" 
        method="POST">
    <input type="hidden" name="source" value="proconnectsa">
    <input type="email" name="email" placeholder="Your email" required>
    <input type="text" name="name" placeholder="Your name" required>
    <button type="submit">Get Report</button>
  </form>
  
  <!-- On submit, redirect to ImmigrationAI -->
  <script>
    document.getElementById('immigrationai-capture').onsubmit = async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      await fetch('https://immigrationai.co.za/api/capture-lead', {
        method: 'POST',
        body: formData
      });
      window.location.href = 'https://immigrationai.co.za/auth/signup';
    };
  </script>
</div>
```

**Pros:**
- ✅ Captures leads immediately
- ✅ Clean embedded experience
- ✅ Direct attribution
- ✅ No CORS issues

**Cons:**
- ⚠️ Requires backend endpoint
- ⚠️ Need to create `/api/capture-lead`

---

### **OPTION 4: API Integration** 
**Best for:** Deep integration with existing ProConnectSA CRM

**Implementation:**
```javascript
// On ProConnectSA backend
async function syncToImmigrationAI(userData) {
  const response = await fetch('https://immigrationai.co.za/api/integrations/proconnectsa', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: userData.email,
      name: userData.fullName,
      source: 'proconnectsa',
      sourceUserId: userData.id,
      metadata: {
        currentPlan: userData.plan,
        country: userData.country
      }
    })
  });
  return response.json();
}

// Then redirect user
window.location.href = 'https://immigrationai.co.za/auth/login?proconnectsa=' + userData.id;
```

**Pros:**
- ✅ Full CRM synchronization
- ✅ Single sign-on possible
- ✅ Shared user data
- ✅ Best tracking

**Cons:**
- ❌ Most complex
- ❌ Requires API development
- ❌ Security considerations
- ❌ Longest implementation time

---

## 🎯 RECOMMENDED INTEGRATION STRATEGY

### **Phase 1: Quick Win (Week 1)** ⭐ DO THIS FIRST
**Goal:** Start funneling traffic immediately

**Steps:**
1. Add button/link on ProConnectSA homepage
2. Link: `https://immigrationai.co.za/auth/signup?source=proconnectsa`
3. Use UTM parameters for tracking
4. Add special promo code in link
5. Monitor analytics

**Code to add on ProConnectSA:**
```html
<!-- Hero Section CTA -->
<a href="https://immigrationai.co.za/auth/signup?source=proconnectsa&utm_source=proconnect&utm_medium=referral&utm_campaign=immigration_tool" 
   class="btn btn-primary btn-lg">
   ✨ Try Our AI Immigration Assistant FREE
   <small>(Powered by ImmigrationAI)</small>
</a>

<!-- Features Section -->
<section class="partnership-section">
  <h2>Powered by ImmigrationAI</h2>
  <p>Our partnership with ImmigrationAI brings you cutting-edge AI tools</p>
  <a href="https://immigrationai.co.za?source=proconnectsa">Learn More →</a>
</section>
```

---

### **Phase 2: Enhanced Experience (Week 2-3)**
**Goal:** Better lead capture and attribution

**Steps:**
1. Create dedicated landing page on ImmigrationAI
2. URL: `https://immigrationai.co.za/proconnectsa`
3. Custom branding/header
4. Pre-filled form with ProConnectSA branding
5. Special pricing for ProConnectSA users
6. Analytics tracking

**Landing Page Features:**
```
Header: "Welcome from ProConnectSA!"
Badge: "Exclusive Partnership"
Benefits:
- 20% off all plans
- Priority support
- Dedicated consultant
CTA: "Start Your Journey"
Footer: "Still with ProConnectSA? Log in here"
```

---

### **Phase 3: Deep Integration (Month 2+)**
**Goal:** Seamless user experience

**Steps:**
1. API endpoint for lead capture
2. Shared authentication tokens
3. Data synchronization
4. Embedded widgets
5. Single sign-on (SSO)
6. Revenue sharing tracking

---

## 📊 TRACKING & ANALYTICS

### UTM Parameters to Use
```
https://immigrationai.co.za/auth/signup?
  source=proconnectsa&
  utm_source=proconnect&
  utm_medium=website&
  utm_campaign=immigration_tool&
  utm_content=hero_cta&
  promo=PROCONNECT20
```

### Database Tracking Field
```typescript
// In users table
source: "proconnectsa"  // Track where user came from
referralCode: "PROCONNECT20"  // Promo code
utmCampaign: string
utmSource: string
utmMedium: string
```

### Analytics Dashboard
```javascript
// Track in analytics
{
  signups_from_proconnectsa: 45,
  conversions_from_proconnectsa: 23,
  revenue_from_proconnectsa: R6,877,
  avg_lifetime_value: R299/month,
  top_converting_destination: "Canada"
}
```

---

## 💰 REVENUE SHARING OPTIONS

### **Option A: Flat Referral Fee**
- R50 per new signup
- R200 per paid subscription

### **Option B: Percentage Split**
- 15% of monthly revenue
- 10% of lifetime revenue

### **Option C: Co-Marketing**
- Joint marketing campaigns
- Shared ad spend
- Branded landing pages

---

## 🔧 TECHNICAL REQUIREMENTS

### From ProConnectSA:
- Add 1-2 HTML buttons/links
- (Optional) JavaScript for tracking
- (Optional) Backend API endpoint for sync

### From ImmigrationAI:
- ✅ Landing page already exists
- ✅ Signup flow ready
- ✅ Analytics ready
- ⚠️ Need to add `source` tracking
- ⚠️ Need promo code system
- ⚠️ (Optional) API endpoint for lead capture
- ⚠️ (Optional) Custom landing page

---

## 🎯 NEXT STEPS

### **Immediate Actions (Do Today):**
1. ✅ Choose integration option (Recommend: Option 1)
2. ✅ Get final domain confirmation
3. ✅ Create UTM tracking parameters
4. ✅ Design button/link for ProConnectSA
5. ✅ Test click-through flow

### **This Week:**
1. Add `source` tracking to database
2. Create promo code system
3. Set up analytics dashboard
4. Test end-to-end flow
5. Deploy to production

### **Future Enhancements:**
1. Custom ProConnectSA landing page
2. API integration for lead sync
3. Embedded widgets
4. Revenue sharing dashboard
5. Co-marketing campaigns

---

## 📞 IMPLEMENTATION CONTACT

**For technical questions:**
- Repository: `/home/paas/immigration_ai`
- Backend: Hetzner VPS (api.immigrationai.co.za)
- Frontend: Vercel (immigrationai.co.za)

**Ready to implement? Let's start with Option 1!**

---

**Questions? Let me know which option you'd like to proceed with!** 🚀

