# 🚀 Vercel Deployment Guide - Pakistani E-Commerce Site

## 📋 Pre-Deployment Checklist

- [ ] Supabase database is set up and running
- [ ] All SQL migrations have been run (payment columns, profiles table, etc.)
- [ ] Admin user is created and has 'admin' role
- [ ] Environment variables are ready
- [ ] Payment gateway credentials are available (sandbox for testing)
- [ ] Domain name is ready (optional)

## 🔧 Step-by-Step Deployment

### **Step 1: Initialize Git Repository**

```bash
# In your project directory
git init
git add .
git commit -m "Initial commit - Pakistani E-commerce with payment integration"

# Push to GitHub (create repository first)
git remote add origin https://github.com/yourusername/your-repo-name.git
git branch -M main
git push -u origin main
```

### **Step 2: Deploy to Vercel**

**Option A: Vercel CLI (Recommended)**
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts:
# - Link to existing project? N
# - Project name: your-ecommerce-site
# - Directory: ./
# - Override settings? N
```

**Option B: Vercel Dashboard**
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure as follows:
   - **Framework Preset:** Next.js
   - **Build Command:** `npm run build`
   - **Output Directory:** Leave blank (uses .next)
   - **Install Command:** `npm install`

### **Step 3: Configure Environment Variables**

In your Vercel project dashboard, go to **Settings** → **Environment Variables** and add:

```env
# Required Variables
NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Pakistani Payment Gateways
JAZZCASH_MERCHANT_ID=your-merchant-id
JAZZCASH_PASSWORD=your-password
JAZZCASH_SECRET_KEY=your-secret-key
JAZZCASH_SANDBOX=true

EASYPAISA_MERCHANT_ID=your-merchant-id
EASYPAISA_PASSWORD=your-password
EASYPAISA_SECRET_KEY=your-secret-key
EASYPAISA_SANDBOX=true

# Business Settings
BUSINESS_NAME=Your Business Name
BUSINESS_EMAIL=orders@yourdomain.com
BUSINESS_PHONE=+92-321-1234567
SHIPPING_ORIGIN_CITY=karachi
```

### **Step 4: Update Supabase URLs**

After deployment, update your Supabase project:

1. **Go to Supabase Dashboard** → **Settings** → **API**
2. **Add your Vercel domain** to "Site URL" and "Redirect URLs":
   - `https://your-app.vercel.app`
   - `https://your-app.vercel.app/auth/callback`
   - `https://your-app.vercel.app/**`

### **Step 5: Test Your Deployment**

Visit your deployed site and test:
- [ ] Homepage loads correctly
- [ ] Product pages work
- [ ] Cart functionality
- [ ] User registration/login
- [ ] Admin login (use `/admin/debug-auth` if needed)
- [ ] Checkout flow with Pakistani payment methods
- [ ] Order placement and management

## 🔍 Troubleshooting Common Issues

### **Build Errors**

```bash
# If you get TypeScript errors
npm run build

# Fix any errors locally first
npm run lint
```

### **Environment Variables Not Working**

1. Make sure variables are added in Vercel dashboard
2. Redeploy after adding variables
3. Check variable names match exactly

### **Supabase Connection Issues**

1. Verify Supabase URL and keys
2. Check if your domain is added to Supabase allowed origins
3. Ensure RLS policies are correct

### **Payment Webhook Issues**

Update webhook URLs in payment provider dashboards:
- JazzCash: `https://your-app.vercel.app/api/payments/jazzcash/callback`
- EasyPaisa: `https://your-app.vercel.app/api/payments/easypaisa/callback`

## 🌐 Custom Domain Setup

### **Step 1: Add Domain to Vercel**
1. Go to your project → **Settings** → **Domains**
2. Add your domain (e.g., `yourdomain.com`)
3. Follow DNS configuration instructions

### **Step 2: Update Environment Variables**
```env
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

### **Step 3: Update Supabase Settings**
Add your custom domain to Supabase redirect URLs.

## 📊 Post-Deployment Setup

### **Analytics & Monitoring**
- Enable Vercel Analytics
- Set up error tracking
- Monitor performance

### **SEO Optimization**
- Update meta tags with your domain
- Submit sitemap to Google
- Set up Google Analytics

### **Security**
- Enable HTTPS (automatic with Vercel)
- Review and test all payment flows
- Set up proper error logging

## 🔄 Continuous Deployment

Every push to your `main` branch will trigger automatic deployment:

```bash
# Make changes
git add .
git commit -m "Update feature"
git push origin main

# Vercel will automatically deploy
```

## 📞 Support Resources

- **Vercel Documentation:** [vercel.com/docs](https://vercel.com/docs)
- **Next.js Deployment:** [nextjs.org/docs/deployment](https://nextjs.org/docs/deployment)
- **Supabase Edge Functions:** [supabase.com/docs](https://supabase.com/docs)

## 🎉 Success!

Your Pakistani e-commerce site with integrated payment methods is now live!

**Key Features Deployed:**
- ✅ Complete product catalog
- ✅ Shopping cart and checkout
- ✅ Pakistani payment methods (JazzCash, EasyPaisa, COD)
- ✅ Admin dashboard
- ✅ Order management and cancellation
- ✅ Pakistani city-based shipping
- ✅ Real-time inventory tracking
- ✅ User authentication and profiles

**Test URLs:**
- Main site: `https://your-app.vercel.app`
- Admin: `https://your-app.vercel.app/admin`
- Debug: `https://your-app.vercel.app/admin/debug-auth`
