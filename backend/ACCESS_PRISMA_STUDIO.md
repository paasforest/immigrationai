# 🔍 Access Prisma Studio from Your Laptop

## Prisma Studio is Running on Hetzner

It's running on `http://localhost:5555` on the server, but you need to access it from your laptop.

---

## 🚀 Option 1: SSH Port Forwarding (Recommended)

**On your laptop, open a NEW terminal and run:**

```bash
ssh -L 5555:localhost:5555 root@78.46.183.41
```

This creates a tunnel so you can access Prisma Studio on your laptop.

**Then open in your browser:**
```
http://localhost:5555
```

**Keep this SSH session open** while using Prisma Studio.

---

## 🚀 Option 2: Access Directly from Server

If you have a browser on the Hetzner server, just open:
```
http://localhost:5555
```

---

## ✅ What You Should See

In Prisma Studio, you should see all your tables including:

### New Multi-Tenant Tables:
- ✅ **organizations**
- ✅ **cases**
- ✅ **case_documents**
- ✅ **tasks**
- ✅ **messages**
- ✅ **document_checklists**
- ✅ **checklist_items**
- ✅ **audit_logs**

### Updated Tables:
- ✅ **users** (with new columns: organization_id, phone, avatar_url, is_active)
- ✅ **subscriptions** (with organization_id instead of user_id)

---

## 🎯 Verify Migration Success

1. **Check `organizations` table** - Should be empty (ready for new orgs)
2. **Check `users` table** - Should have `organization_id` column (nullable)
3. **Check `subscriptions` table** - Should have `organization_id` column

---

**Use SSH port forwarding to access Prisma Studio from your laptop!** 🚀
