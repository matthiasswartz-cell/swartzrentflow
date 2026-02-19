# 🚀 RentFlow Pro — Deployment Guide
## Get Your App Live in Under 1 Hour

Follow these steps IN ORDER. Each one takes 5-10 minutes.
No coding experience needed — just follow the screenshots-level instructions below.

---

## STEP 1: Install Required Software (5 min)

You need TWO things installed on your computer:

### A) Node.js (the engine that runs the app)
1. Go to https://nodejs.org
2. Download the **LTS** version (the green button)
3. Run the installer — click Next through everything
4. When done, open **Command Prompt** (Windows) or **Terminal** (Mac)
5. Type: `node --version`
6. You should see something like `v20.x.x` — if so, you're good

### B) Git (for deploying code)
1. Go to https://git-scm.com/downloads
2. Download for your OS, install with default settings
3. In Command Prompt/Terminal, type: `git --version`
4. You should see `git version 2.x.x`

---

## STEP 2: Create Your Accounts (15 min)

You need FOUR free accounts. Open each in a new tab:

### A) GitHub (where your code lives)
1. Go to https://github.com
2. Sign up (free)
3. After signup, create a new repository:
   - Click the green **"New"** button
   - Name it `rentflow-pro`
   - Make it **Private**
   - Click **Create repository**

### B) Clerk (handles login/signup)
1. Go to https://clerk.com
2. Sign up (free)
3. Create a new application called "RentFlow Pro"
4. Choose **Email** as a sign-in method
5. Go to **API Keys** in the sidebar
6. Copy your **Publishable Key** and **Secret Key** — save these!

### C) Railway (runs your database)
1. Go to https://railway.app
2. Sign up with GitHub (easiest)
3. Click **New Project** → **Deploy PostgreSQL**
4. Once it's created, click on it → **Variables** tab
5. Copy the **DATABASE_URL** value — save this!

### D) Vercel (hosts your website)
1. Go to https://vercel.com
2. Sign up with GitHub (easiest)
3. Don't deploy anything yet — we'll do that in Step 5

---

## STEP 3: Set Up the Code (10 min)

Open Command Prompt (Windows) or Terminal (Mac):

```bash
# 1. Go to your Desktop (or wherever you want the project)
cd Desktop

# 2. Copy the rentflow-pro folder here (you downloaded it from Claude)
#    If you downloaded a ZIP, unzip it first

# 3. Go into the project folder
cd rentflow-pro

# 4. Install all the code libraries
npm install

# 5. Create your environment file
#    Copy .env.example to .env.local
#    On Windows:  copy .env.example .env.local
#    On Mac:      cp .env.example .env.local
```

Now open `.env.local` in Notepad (Windows) or TextEdit (Mac) and fill in your real values:

```
DATABASE_URL="paste your Railway DATABASE_URL here"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="paste your Clerk publishable key"
CLERK_SECRET_KEY="paste your Clerk secret key"
```

Leave the other values as they are for now.

---

## STEP 4: Set Up the Database (5 min)

Still in Command Prompt/Terminal, inside the rentflow-pro folder:

```bash
# This creates all the database tables
npx prisma db push

# You should see "Your database is now in sync with your Prisma schema"
```

If you see that message, your database is ready!

Optional — to see your database visually:
```bash
npx prisma studio
```
This opens a browser window where you can see all your tables.

---

## STEP 5: Test Locally (5 min)

```bash
npm run dev
```

Open your browser and go to: **http://localhost:3000**

You should see the RentFlow Pro landing page! Try:
1. Click "Create Account"
2. Sign up with your email (Clerk handles this)
3. Fill in your store info on the onboarding page
4. You should land on the Dashboard

If that works, your app is RUNNING. Now let's put it on the internet.

---

## STEP 6: Deploy to the Internet (10 min)

### Push code to GitHub:

```bash
# In the rentflow-pro folder:
git init
git add .
git commit -m "Initial RentFlow Pro deployment"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/rentflow-pro.git
git push -u origin main
```

Replace `YOUR-USERNAME` with your actual GitHub username.

### Deploy on Vercel:

1. Go to https://vercel.com/new
2. Click **Import Git Repository**
3. Select your `rentflow-pro` repository
4. Before clicking Deploy, click **Environment Variables**
5. Add ALL the variables from your `.env.local` file:
   - `DATABASE_URL` → paste value
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` → paste value
   - `CLERK_SECRET_KEY` → paste value
   - `NEXT_PUBLIC_APP_URL` → leave blank for now
6. Click **Deploy**
7. Wait 2-3 minutes...

Vercel will give you a URL like: `rentflow-pro-abc123.vercel.app`

**YOUR APP IS NOW LIVE ON THE INTERNET.**

---

## STEP 7: Connect Your Custom Domain (5 min)

1. Buy your domain at https://namecheap.com (search `rentflowpro.com`)
2. In Vercel, go to your project → **Settings** → **Domains**
3. Type `rentflowpro.com` and click Add
4. Vercel shows you DNS records to add
5. Go to Namecheap → **Domain List** → **Manage** → **Advanced DNS**
6. Add the records Vercel tells you to (usually an A record and CNAME)
7. Wait 5-30 minutes for DNS to propagate

Now `rentflowpro.com` shows your app!

---

## STEP 8: Update Clerk Redirect URLs

1. Go to https://dashboard.clerk.com
2. Select your app → **Paths** (or **URLs**)
3. Set:
   - Sign-in URL: `/sign-in`
   - Sign-up URL: `/sign-up`
   - After sign-in: `/dashboard`
   - After sign-up: `/onboarding`
4. Under **Allowed Origins**, add:
   - `https://rentflowpro.com`
   - `https://rentflow-pro-YOUR-VERCEL-URL.vercel.app`

---

## DONE! 🎉

Your app is live. You can:
- Sign in from any browser anywhere
- Add customers, inventory, contracts
- Process payments
- Manage IoT HVAC devices
- View reports and collections

---

## MONTHLY COSTS

| Service | Cost | What it does |
|---------|------|-------------|
| Vercel | FREE (hobby) or $20/mo (pro) | Hosts your website |
| Railway (PostgreSQL) | $5-25/mo | Your database |
| Clerk | FREE up to 10,000 users | Login system |
| Namecheap domain | $10-15/year | Your .com address |
| **TOTAL** | **$5-45/month** | |

---

## TROUBLESHOOTING

**"Cannot find module @prisma/client"**
→ Run `npx prisma generate` then `npm run build`

**"Clerk: Missing publishable key"**
→ Check your `.env.local` has the Clerk keys, no extra spaces

**"Database connection refused"**
→ Check your DATABASE_URL is correct from Railway. Make sure it includes `?sslmode=require` at the end

**Vercel deploy fails**
→ Check the build logs in Vercel dashboard. Usually a missing env variable.

**Can't see my domain**
→ DNS takes up to 30 minutes. Try clearing browser cache or use incognito.

---

## NEXT STEPS (After Launch)

1. **Add Stripe** — For real payment processing (see Stripe Connect docs)
2. **Add Twilio** — For SMS features (get a Twilio account + phone number)
3. **Seed demo data** — Run `npm run db:seed` to populate test data
4. **Hire a developer** — Use the Developer Handoff doc to add advanced features
