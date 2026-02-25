# ⚠️ DO NOT RESET - Production Database!

## 🚨 Important

**DO NOT run `prisma migrate reset`** - it will DELETE ALL YOUR DATA!

---

## ✅ Safe Approach for Production

Since this is a production database with existing data, use `prisma db push` instead:

```bash
npx prisma db push
```

This will:
- ✅ Add new tables safely
- ✅ Add indexes safely
- ✅ NOT delete any existing data
- ✅ NOT reset the database

---

## 🎯 Run This Instead

```bash
cd /var/www/immigrationai/backend
npx prisma db push
npx prisma generate
pm2 restart all
```

---

## Why `db push` Instead of `migrate dev`?

- `migrate dev` = For development (can reset database)
- `db push` = For production (safe, no data loss)

---

**Run `npx prisma db push` instead!** ✅
