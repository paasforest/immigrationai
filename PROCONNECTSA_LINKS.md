# 🔗 ProConnectSA → ImmigrationAI Tracking Links

## Use These URLs on ProConnectSA Website

Copy and paste these exact URLs into your ProConnectSA website to track traffic!

---

## 📍 **Homepage**

### Hero Section (Main Banner)
```
https://immigrationai.co.za?utm_source=proconnectsa&utm_medium=website&utm_campaign=immigration_integration&utm_content=hero_banner
```

### Features Section
```
https://immigrationai.co.za?utm_source=proconnectsa&utm_medium=website&utm_campaign=immigration_integration&utm_content=features_section
```

---

## 🧭 **Navigation Menu**

### Main Nav Link
```
https://immigrationai.co.za?utm_source=proconnectsa&utm_medium=website&utm_campaign=immigration_integration&utm_content=nav_menu
```

### Services Dropdown
```
https://immigrationai.co.za?utm_source=proconnectsa&utm_medium=website&utm_campaign=immigration_integration&utm_content=services_dropdown
```

---

## 📄 **Service Pages**

### Immigration Services Page
```
https://immigrationai.co.za?utm_source=proconnectsa&utm_medium=website&utm_campaign=immigration_integration&utm_content=immigration_page
```

### About Page
```
https://immigrationai.co.za?utm_source=proconnectsa&utm_medium=website&utm_campaign=immigration_integration&utm_content=about_page
```

### Contact Page
```
https://immigrationai.co.za?utm_source=proconnectsa&utm_medium=website&utm_campaign=immigration_integration&utm_content=contact_page
```

---

## 💰 **Pricing & Signup**

### Pricing Page Direct Link
```
https://immigrationai.co.za/pricing?utm_source=proconnectsa&utm_medium=website&utm_campaign=immigration_integration&utm_content=pricing_link
```

### "Get Started" Button
```
https://immigrationai.co.za/auth/signup?utm_source=proconnectsa&utm_medium=website&utm_campaign=immigration_integration&utm_content=get_started_button
```

---

## 📝 **Blog & Content**

### Blog Post Link (Example)
```
https://immigrationai.co.za?utm_source=proconnectsa&utm_medium=website&utm_campaign=immigration_integration&utm_content=blog_visa_guide
```

### Case Study Link
```
https://immigrationai.co.za?utm_source=proconnectsa&utm_medium=website&utm_campaign=immigration_integration&utm_content=case_study
```

---

## 🔗 **Footer**

### Footer Link
```
https://immigrationai.co.za?utm_source=proconnectsa&utm_medium=website&utm_campaign=immigration_integration&utm_content=footer_link
```

### Footer "Partner Services"
```
https://immigrationai.co.za?utm_source=proconnectsa&utm_medium=website&utm_campaign=immigration_integration&utm_content=footer_partners
```

---

## 📧 **Email Campaigns**

### Email Newsletter
```
https://immigrationai.co.za?utm_source=proconnectsa&utm_medium=email&utm_campaign=monthly_newsletter&utm_content=december_2024
```

### Email Signature
```
https://immigrationai.co.za?utm_source=proconnectsa&utm_medium=email&utm_campaign=immigration_integration&utm_content=email_signature
```

### Promotional Email
```
https://immigrationai.co.za?utm_source=proconnectsa&utm_medium=email&utm_campaign=immigration_promo&utm_content=special_offer
```

---

## 📱 **Social Media**

### Facebook Post
```
https://immigrationai.co.za?utm_source=proconnectsa&utm_medium=social&utm_campaign=immigration_integration&utm_content=facebook_post
```

### LinkedIn Post
```
https://immigrationai.co.za?utm_source=proconnectsa&utm_medium=social&utm_campaign=immigration_integration&utm_content=linkedin_post
```

### Instagram Bio Link
```
https://immigrationai.co.za?utm_source=proconnectsa&utm_medium=social&utm_campaign=immigration_integration&utm_content=instagram_bio
```

### Twitter/X Post
```
https://immigrationai.co.za?utm_source=proconnectsa&utm_medium=social&utm_campaign=immigration_integration&utm_content=twitter_post
```

---

## 📄 **Offline Materials**

### QR Code (Brochures)
```
https://immigrationai.co.za?utm_source=proconnectsa&utm_medium=qr_code&utm_campaign=immigration_integration&utm_content=brochure
```

### QR Code (Business Cards)
```
https://immigrationai.co.za?utm_source=proconnectsa&utm_medium=qr_code&utm_campaign=immigration_integration&utm_content=business_card
```

### QR Code (Posters)
```
https://immigrationai.co.za?utm_source=proconnectsa&utm_medium=qr_code&utm_campaign=immigration_integration&utm_content=poster
```

---

## 🎯 **Specific Landing Pages**

### SOP Generator Direct
```
https://immigrationai.co.za/documents/sop?utm_source=proconnectsa&utm_medium=website&utm_campaign=immigration_integration&utm_content=sop_generator
```

### Visa Checker Direct
```
https://immigrationai.co.za/documents/visa-checker?utm_source=proconnectsa&utm_medium=website&utm_campaign=immigration_integration&utm_content=visa_checker
```

### Interview Coach Direct
```
https://immigrationai.co.za/documents/interview-coach?utm_source=proconnectsa&utm_medium=website&utm_campaign=immigration_integration&utm_content=interview_coach
```

---

## 💡 **How to Use**

1. **Copy the URL** you want to use
2. **Paste it** as the `href` in your ProConnectSA website:
   ```html
   <a href="PASTE_URL_HERE">Visit ImmigrationAI</a>
   ```
3. **Done!** Traffic will be tracked automatically

---

## 📊 **Checking Results**

### See Signups from ProConnectSA
```sql
SELECT COUNT(*) FROM user_tracking WHERE utm_source = 'proconnectsa';
```

### See Which Link Gets Most Clicks
```sql
SELECT 
  utm_content,
  COUNT(*) as signups
FROM user_tracking
WHERE utm_source = 'proconnectsa'
GROUP BY utm_content
ORDER BY signups DESC;
```

### See Conversion Rate
```sql
SELECT 
  COUNT(*) as total_signups,
  SUM(CASE WHEN converted THEN 1 ELSE 0 END) as paid_customers,
  ROUND(SUM(CASE WHEN converted THEN 1 ELSE 0 END)::numeric / COUNT(*)::numeric * 100, 2) as conversion_rate_percent
FROM user_tracking
WHERE utm_source = 'proconnectsa';
```

---

## ✅ **Quick Start**

**Step 1:** Pick 3-5 key locations on ProConnectSA:
- Homepage hero
- Navigation menu  
- Footer
- One service page
- Email signature

**Step 2:** Update those links with the tracking URLs above

**Step 3:** Wait 24 hours

**Step 4:** Run SQL queries to see results!

---

## 🎯 **Pro Tips**

### Tip 1: Test First
Before updating all links, test one:
1. Use the URL in a private browser
2. Sign up for a test account
3. Check database to confirm tracking worked

### Tip 2: Use Clear Content Names
Make `utm_content` descriptive:
- ✅ `hero_banner` - Clear where it came from
- ❌ `link1` - Not descriptive

### Tip 3: Track Everything
Add UTM parameters to:
- All website links
- All email links
- All social media posts
- QR codes
- Email signatures

---

## 📈 **Expected Results**

After 30 days, you'll know:
- ✅ How many signups from ProConnectSA
- ✅ Which ProConnectSA page drives most signups
- ✅ Conversion rate (free → paid)
- ✅ ROI of cross-promotion
- ✅ Best performing campaigns

---

**Last Updated:** November 3, 2025  
**Status:** Ready to Use  
**Questions?** Check UTM_TRACKING_IMPLEMENTATION.md for full guide

