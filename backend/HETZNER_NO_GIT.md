# 🚀 Run Migration Without Git

## ✅ Commands (No Git Pull Needed)

Since it's not a Git repository, just run:

```bash
cd /var/www/immigrationai/backend
npx prisma migrate dev --name add_multi_tenant_models
npx prisma generate
pm2 restart all
```

---

## Or All at Once:

```bash
cd /var/www/immigrationai/backend && npx prisma migrate dev --name add_multi_tenant_models && npx prisma generate && pm2 restart all
```

---

**Run these commands on your Hetzner server!** 🚀
