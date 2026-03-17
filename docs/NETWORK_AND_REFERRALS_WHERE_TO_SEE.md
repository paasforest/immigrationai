# Where to see Network & Referrals (agent vs admin)

## If you log in as an **agent** (agency user: org_admin or professional)

You should see the new features in the **Agency dashboard** (Immigration dashboard), **not** in the platform Admin panel.

### 1. Sidebar (left nav)

- Go to: **Dashboard → Immigration** (you’re usually redirected there after login: `/dashboard/immigration`).
- In the **left sidebar** look for a section titled **NETWORK** with two links:
  - **Network** – directory of professionals
  - **Referrals** – referrals inbox (sent / received)

They appear between **MAIN** and **CLIENTS**.

### 2. Overview page

- Open **Overview**: `/dashboard/immigration` (first page after login).
- In **Quick Actions** you should see two extra cards:
  - **Network**
  - **Referrals**

### 3. Direct URLs

- Network directory: `/dashboard/immigration/network`
- Referrals inbox: `/dashboard/immigration/referrals`
- From a **lead** detail page: **“Refer this lead”** button (opens referral modal).
- From a **case** detail page: **“Refer this case”** button in the case header.

### If you still don’t see the sidebar or Quick Actions

- **Hard refresh**: e.g. Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac), or try an incognito/private window.
- **Check URL**: you must be on `/dashboard/immigration` or a sub-route (e.g. `/dashboard/immigration/leads`). If you’re on `/dashboard` only, the page may redirect; the sidebar comes from the **immigration** layout.
- **Vercel**: the frontend deploys from git. If you just pushed, wait for the Vercel build to finish; then hard refresh so the browser doesn’t use an old cached bundle.

---

## If you log in as **platform admin** (admin / super_admin)

- You are redirected to the **Admin** panel (`/admin`), which is a **different app**.
- **Network and Referrals were not added to the Admin dashboard.** They are only in the **Agency (Immigration) dashboard** for org users.
- So seeing “no changes” in the admin dashboard is expected.

To use Network/Referrals you need to use an **agency account** (user in an organization with role org_admin or professional) and go to the Immigration dashboard.

---

## Summary

| Where you are              | Do you see Network & Referrals? |
|---------------------------|----------------------------------|
| Agency dashboard (immigration) | Yes – sidebar (NETWORK) and Quick Actions (Network, Referrals), plus “Refer this lead/case” on lead/case pages. |
| Platform Admin dashboard  | No – not implemented there.     |
| Applicant portal          | No – different product area.    |
