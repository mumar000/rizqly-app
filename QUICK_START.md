# Quick Start Guide

Get Flux Financial running in 5 minutes!

## Step 1: Install Dependencies (30 seconds)

```bash
npm install
```

## Step 2: Set Up Supabase (2 minutes)

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for it to initialize (~2 minutes)
3. Copy your project URL and anon key from Settings → API

## Step 3: Configure Environment (30 seconds)

Create a `.env.local` file in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 4: Set Up Database (1 minute)

1. In Supabase dashboard, go to SQL Editor
2. Copy the SQL from `SUPABASE_SETUP.md` (lines 33-155)
3. Paste and run the query

## Step 5: Run the App (10 seconds)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## First Time Usage

1. **Sign Up**: Create an account with email/password
2. **Onboarding**: Swipe through 4 intro screens
3. **Home**: You'll see the main dashboard with mock data
4. **Add Expense**: Tap the + button to add your first expense

## What You'll See

- 🏠 **Home Screen**: Balance card, spend rings, recent transactions
- 👤 **Auth Screen**: Beautiful login/signup
- 👋 **Onboarding**: Swipe-based introduction
- ➕ **Add Expense**: Quick expense entry with emojis

## Current Limitations

The app is in Phase 1 development:
- ✅ All UI components are built and working
- ✅ Authentication is fully functional
- ⚠️ Expense modal doesn't save to database yet (coming next!)
- ⚠️ Home screen shows mock data (will load real data soon)
- ⏳ Insights and Goals screens not built yet

## Troubleshooting

**"Missing Supabase environment variables"**
- Make sure `.env.local` exists in project root
- Restart the dev server after creating .env.local

**Build fails**
- Set placeholder env vars: `NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder npm run build`

**Can't sign up/login**
- Check Supabase project is running
- Verify env variables are correct
- Check browser console for errors

## Next Steps

Once you're up and running:
1. Read `README_DEV.md` for full development guide
2. Check `PROJECT_STATUS.md` for what's completed
3. Review `SUPABASE_SETUP.md` for detailed database info
4. Start connecting real data to replace mock data!

---

Need help? Check the detailed setup guide in `SUPABASE_SETUP.md`
