# Admin User Setup

To create your first admin user for the Immigration AI platform:

## Recommended: Run on Hetzner server (production database)

```bash
cd ~/immigration_ai/backend
./create-admin-remote.sh Admin@immigrationai.co.za 'Admin123!'
```

This SSHs to your Hetzner server and runs the script there (where the database is reachable). **Requires SSH access** to `root@78.46.183.41`.

If auto-detect fails, specify the backend path:
```bash
BACKEND_PATH=/var/www/immigrationai/backend ./create-admin-remote.sh Admin@immigrationai.co.za 'Admin123!'
```

## Local (if DATABASE_URL in .env points to a reachable database)

```bash
cd ~/immigration_ai/backend
node create-admin-user.js your-email@example.com YourSecurePassword123
```

**Requirements:**
- `DATABASE_URL` in `.env` must be valid (format: `postgresql://user:password@host:5432/database`)
- Database must be reachable from your machine

## Quick setup (auto-generated credentials)

```bash
cd backend
node create-admin-user.js
```

Creates admin with email `admin@immigrationai.co.za` and a random password (printed to console). **Save the password** – you won't see it again.

## After creation

1. Log in at https://immigrationai.co.za/auth/login with your admin credentials
2. You'll be redirected to `/admin` (the admin dashboard)
3. Use the sidebar to navigate: Dashboard, Organizations, Marketplace, Payments, Verifications, Users, Analytics, and more

## Upgrading an existing user

If the email already exists, the script will **upgrade** that user to admin (role: admin, plan: enterprise, status: active) instead of creating a new one.
