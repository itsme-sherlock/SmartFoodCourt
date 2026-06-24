# ⚡ Quick Supabase Setup for Vercel Deployed App

Your SmartFoodCourt is already deployed on Vercel. Follow these steps to reconnect to a new Supabase project in **5 minutes**.

---

## 🔧 Step 1: Create New Supabase Project (2 mins)

1. Go to [supabase.com](https://supabase.com)
2. Sign in → Click **"New Project"**
3. Configure:
   - **Project Name**: `SmartFoodCourt`
   - **Database Password**: Save this somewhere safe!
   - **Region**: Choose closest to your users
4. Click **"Create new project"** → Wait for initialization ⏳

---

## 🔑 Step 2: Get Your API Credentials (1 min)

1. Go to **Settings** → **API**
2. Copy these three values (you'll need them):
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** (long string starting with `eyJ`)
   - **service_role** (long string starting with `eyJ`)

---

## 🗄️ Step 3: Create Database Schema (1 min)

1. In Supabase dashboard, click **SQL Editor** (left sidebar)
2. Click **"New query"** button
3. Delete any template code and paste **entire content** from this file: `supabase_init_schema.sql`
4. Click **"Run"** button (big blue button)
5. Wait for ✅ success message

---

## 🔒 Step 4: Set Up Security Policies (1 min)

1. In **SQL Editor**, click **"New query"** again
2. Paste **entire content** from: `supabase_rls_policies.sql`
3. Click **"Run"**
4. Wait for ✅ success message

---

## 🚀 Step 5: Update Vercel Environment Variables (1 min)

1. Go to your Vercel dashboard
2. Select **SmartFoodCourt** project
3. Go to **Settings** → **Environment Variables**
4. Add/Update these 3 variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

5. Click **"Save"** for each one

---

## 🔄 Step 6: Redeploy on Vercel

1. In Vercel, go to your **SmartFoodCourt** project
2. Click **"Deployments"** tab
3. Find the latest deployment, click the **...** menu
4. Click **"Redeploy"**
5. Wait for deployment to finish ✅

---

## ✅ Step 7: Verify Everything Works

1. Open your Vercel app URL
2. Try creating an order
3. Check Supabase **Table Editor** → `orders` table should show your new order
4. Check real-time is working (dashboard updates live)

---

## 📝 What Just Happened

✅ Created `orders` table - stores all orders  
✅ Created `vendor_orders` table - vendor order tracking  
✅ Set up security policies - RLS enabled  
✅ Enabled real-time - orders update live  
✅ Connected Vercel app to new Supabase project  

---

## 🆘 If Something Goes Wrong

### "Connection refused" error?
→ Check environment variables are **exactly** copied (no extra spaces)  
→ Redeploy Vercel after updating variables

### Tables not showing?
→ Refresh Supabase page or wait 30 seconds  
→ Check SQL ran without errors (look for red error messages)

### Real-time not updating?
→ Make sure RLS policies are applied (Step 4)  
→ Check browser console for errors

### "Missing column" errors?
→ Run this file: `supabase-migration-add-reservation-fields.sql` in SQL Editor

---

## 📚 SQL Files Reference

| File | Purpose |
|------|----------|
| `supabase_init_schema.sql` | Creates tables & indexes |
| `supabase_rls_policies.sql` | Sets up security rules |
| `supabase-migration-add-reservation-fields.sql` | Adds reservation features (if needed) |

---

**Done! Your app should now be connected to Supabase.** 🎉

If you need help, check the files in the repo root or reach out!