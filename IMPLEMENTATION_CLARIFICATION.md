# 📋 Implementation Clarification

## 1. Cover Letter Generator - Where & How?

### **Location in Dashboard:**
- ✅ **YES** - It will be a **tool card in the main dashboard** (like Purpose of Visit, SOP Generator, etc.)
- ❌ **NO** - It's **NOT under Schengen** - it's a **general tool for ALL countries** (Canada, UK, Schengen, USA, etc.)
- The Cover Letter Generator works for **any country** - you just select the country when using it

### **Which Tier/Plan:**
- **Professional Plan or higher** (R699/month) - same as Purpose of Visit
- This matches your marketing video where you mention "Professional Plan" for Cover Letter

### **What "Similar to Purpose of Visit" Means:**

The Cover Letter page will have the **same structure** as Purpose of Visit:

```
┌─────────────────────────────────────────────────┐
│  [Back to Dashboard]                           │
├─────────────────────────────────────────────────┤
│  📄 Cover Letter Generator                      │
│  Create a professional cover letter for embassy │
├──────────────────┬──────────────────────────────┤
│                  │                                │
│  FORM (Left)     │  GENERATED LETTER (Right)     │
│                  │                                │
│  - Full Name     │  [Generated cover letter      │
│  - Address       │   appears here after          │
│  - Email         │   clicking "Generate"]         │
│  - Embassy Name  │                                │
│  - Country       │  [Copy] [Download PDF]        │
│  - Visa Type     │                                │
│  - Travel Dates  │                                │
│  - Purpose       │                                │
│                  │                                │
│  [Generate]      │                                │
│                  │                                │
└──────────────────┴──────────────────────────────┘
```

**File Structure:**
- **New file**: `/app/documents/cover-letter/page.tsx`
- **Similar to**: `/app/documents/purpose-of-visit/page.tsx`
- **Dashboard link**: Add to `/app/dashboard/page.tsx` in the features array

---

## 2. Schengen Support in SOP Generator

### **What Will Change:**
- Add **"Schengen"** to the country dropdown (currently: USA, Canada, UK, Germany, Australia)
- Add **"tourism"** to the purpose dropdown (currently: study, work, immigration)
- Update form labels to be tourism-friendly when "tourism" is selected

### **Where:**
- File: `/app/documents/sop/page.tsx`
- It's the **same SOP Generator tool** - just adding more options

### **Tier:**
- **Starter Plan** (R149/month) - SOP Generator is available to all plans

---

## 3. Schengen in Relationship Proof Kit

### **What Will Change:**
- Add **"Schengen Type C Family Visit"** to the visa types list
- Currently has: Ireland, Canada, UK, Australia
- Will add: Schengen Type C Family Visit

### **Where:**
- File: `/app/documents/proofkit/page.tsx`
- Line ~18: Add to the `visaTypes` array

### **Tier:**
- **Professional Plan** (R699/month) - same as Relationship Proof Kit

---

## 📊 Summary Table

| Feature | Location | Tier | Status |
|---------|----------|------|--------|
| **Cover Letter Generator** | Dashboard tool card | Professional+ | ❌ Need to create page |
| **Schengen in SOP** | SOP Generator dropdown | Starter+ | ❌ Need to add options |
| **Schengen in Proof Kit** | Proof Kit visa list | Professional+ | ❌ Need to add option |

---

## 🎯 Implementation Plan

### **Step 1: Add Schengen to SOP Generator** (30 min)
- Modify `/app/documents/sop/page.tsx`
- Add "Schengen" to country dropdown
- Add "tourism" to purpose dropdown
- Update form labels for tourism context

### **Step 2: Create Cover Letter Page** (1-2 hours)
- Create `/app/documents/cover-letter/page.tsx`
- Copy structure from Purpose of Visit page
- Adapt form fields for cover letter (Name, Embassy, Country, Visa Type, Travel Dates, Purpose)
- Connect to backend: `POST /api/documents/generate-cover-letter`
- Add dashboard link in `/app/dashboard/page.tsx` with `premium: true`

### **Step 3: Add Schengen to Proof Kit** (30 min)
- Modify `/app/documents/proofkit/page.tsx`
- Add `{ id: 'schengen_type_c_family', name: 'Schengen Type C Family Visit', country: 'Schengen' }` to visaTypes array

---

## 🔍 Visual Example: Dashboard After Changes

```
┌─────────────────────────────────────────────────────────┐
│  Immigration AI Dashboard                                │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  [SOP Generator] [SOP Reviewer] [Visa Eligibility]      │
│                                                           │
│  [Email Generator] [Support Letters] [Travel History]    │
│                                                           │
│  [Financial Letter] [Purpose of Visit]                  │
│                                                           │
│  [Cover Letter] ← NEW! (Professional Plan)              │
│                                                           │
│  [Relationship Proof Kit] ← Will include Schengen       │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

---

## ✅ Confirmation

**You confirmed:**
- ✅ Add Schengen to Relationship Proof Kit - **YES**

**Questions answered:**
1. ✅ Cover Letter = Dashboard tool (not under Schengen)
2. ✅ Cover Letter = Professional Plan tier
3. ✅ "Similar to Purpose of Visit" = Same page structure/layout
4. ✅ Schengen Proof Kit = Add to existing list

**Ready to implement?** 🚀


