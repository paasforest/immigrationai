# 🔧 Found the Issue!

## Problem

The frontend signup form is sending `subscriptionPlan: 'starter'` which overrides the backend default!

**Frontend code** (`app/auth/signup/page.tsx` line 26):
```typescript
subscriptionPlan: 'starter', // Default plan
```

**Backend code** was:
```typescript
subscriptionPlan || 'marketing_test'  // This gets 'starter' from frontend!
```

## Solution

I've updated the backend to **always** use `'marketing_test'` and **ignore** any subscriptionPlan parameter from frontend.

**New backend code**:
```typescript
'marketing_test'  // Always this, ignore frontend parameter
```

## Files Updated

1. ✅ `backend/src/services/authService.ts` - Always uses 'marketing_test'
2. ✅ `backend/src/services/authService.prisma.ts` - Always uses 'marketing_test'

## Deploy This Fix

**On Hetzner, run:**

```bash
cd /var/www/immigrationai/backend

# Upload updated files from local machine first
# (From local machine:)
# scp backend/src/services/authService.ts root@78.46.183.41:/var/www/immigrationai/backend/src/services/
# scp backend/src/services/authService.prisma.ts root@78.46.183.41:/var/www/immigrationai/backend/src/services/

# Then on Hetzner:
rm -rf dist
npm run build
pm2 restart immigration-backend
```

---

**This will fix it!** The backend will now always assign `marketing_test` regardless of what the frontend sends. 🚀
