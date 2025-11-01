# 🔐 ADMIN SETUP GUIDE

## Current Payment Flow

### When User Uploads Payment Proof:

1. **User Gets Payment Instructions**
   - Account Number: PA24220 (unique per user)
   - Bank: FNB
   - Account Number: 1234567890
   - Branch Code: 250655
   - Amount: R299.00

2. **User Uploads Proof**
   - User uploads screenshot of payment
   - Code **IMMEDIATELY ACTIVATES** the account
   - Sets subscription to 'active'
   - Creates subscription record

3. **Admin Verification**
   - Admin can view payment proofs at `/admin/payments`
   - See all uploaded proofs
   - Manually verify if payment matches

## ⚠️ CRITICAL ISSUE FOUND

**The current code AUTO-ACTIVATES accounts when payment proof is uploaded!**

This is in `backend/src/controllers/paymentProofController.ts` line 89-90:

```typescript
// Immediately activate the user's account
await this.activateUserAccount(userId, proofId);
```

**This bypasses manual verification!**

---

## 🔧 NEEDS TO BE FIXED

### Current Flow (WRONG):
1. User uploads payment proof
2. ✅ Account activated IMMEDIATELY
3. Admin can verify later (but user already has access)

### Should Be:
1. User uploads payment proof
2. ❌ Account stays 'pending'
3. Admin verifies payment
4. ✅ Admin approves → account activated

---

## 🛠️ HOW TO SET UP ADMIN ACCESS

### Option 1: Create Admin User via Database

```sql
-- SSH into Hetzner
ssh root@78.46.183.41

-- Connect to database
psql -U postgres -d immigrationai

-- Create admin user
INSERT INTO users (id, email, password_hash, full_name, role, subscription_plan, subscription_status, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'admin@immigrationai.co.za',
  '$2b$10$YOUR_HASHED_PASSWORD_HERE',
  'Admin User',
  'admin',
  'enterprise',
  'active',
  NOW(),
  NOW()
);
```

### Option 2: Update Existing User to Admin

```sql
-- Make existing user an admin
UPDATE users 
SET role = 'admin' 
WHERE email = 'your_email@example.com';
```

---

## 🚨 CURRENT SECURITY GAP

**Admin routes have NO role check!**

In `backend/src/controllers/adminController.ts` line 14-17:

```typescript
// TODO: Add admin role check
// if (req.user.role !== 'admin') {
//   return sendError(res, 'FORBIDDEN', 'Admin access required', 403);
// }
```

**THIS IS COMMENTED OUT - ANY USER CAN ACCESS ADMIN PANEL!**

---

## ✅ FIXES NEEDED

1. **Remove auto-activation** from payment proof upload
2. **Add admin role check** to admin routes
3. **Create role column** in users table if not exists
4. **Add admin login page** on frontend
5. **Protect admin routes** with role middleware

---

## 📍 Admin URLs

- **Admin Panel**: `https://immigrationai.co.za/admin/payments`
- **Pending Payments API**: `GET /api/admin/payments/pending`
- **Verify Payment API**: `POST /api/admin/payments/:paymentId/verify`
- **Reject Payment API**: `POST /api/admin/payments/:paymentId/reject`

---

## 🔑 To Login as Admin

1. Go to `/auth/login`
2. Use admin email/password
3. After login, go to `/admin/payments`
4. Can view all pending payments

**BUT:** Currently any authenticated user can access this! Need to fix role check.

---

## 📝 Next Steps

1. **URGENT:** Fix auto-activation issue
2. **URGENT:** Add role-based access control
3. Create dedicated admin login flow
4. Add role column if missing
5. Test admin verification flow

