# Flux Financial - Gen Z Personal Finance App

A modern, mobile-first personal finance and expense management app built for Gen Z users. Features a dark, aesthetic design with smooth animations and an addictive user experience.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Animations**: Framer Motion
- **UI Components**: Radix UI

## Getting Started

### 1. Clone and Install

```bash
npm install
```

### 2. Set Up Supabase

Follow the detailed guide in `SUPABASE_SETUP.md` to:
- Create a Supabase project
- Set up the database schema
- Configure authentication
- Get your API keys

### 3. Configure Environment Variables

Create a `.env.local` file (use `.env.local.example` as template):

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
flux-financial-genz/
├── app/                    # Next.js app directory
│   ├── auth/              # Authentication pages
│   ├── home/              # Main home screen
│   ├── onboarding/        # Swipe-based onboarding
│   ├── globals.css        # Global styles & theme
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Entry point (redirects)
├── components/
│   ├── mobile/            # Mobile-specific components
│   │   ├── BalanceCard.tsx
│   │   ├── SpendRing.tsx
│   │   ├── FloatingActionButton.tsx
│   │   └── AddExpenseModal.tsx
│   └── desktop/           # Desktop components (future)
├── hooks/
│   └── useAuth.ts         # Authentication hook
├── lib/
│   └── supabase/
│       └── client.ts      # Supabase client configuration
├── types/
│   └── supabase.ts        # Database type definitions
└── public/                # Static assets
```

## Features Implemented

### ✅ Phase 1 - Core Mobile Experience

- **Authentication**
  - Email/password sign up and sign in
  - Beautiful glass-morphism design
  - Auto-redirect based on auth state

- **Onboarding**
  - Swipe-based 4-step onboarding
  - Smooth animations
  - Skip option
  - Progress indicators

- **Home Screen**
  - Big balance card with gradient effects
  - Income/Expense breakdown
  - Spend rings for budget tracking
  - Recent transactions list
  - Bottom navigation
  - Floating action button

- **Add Expense**
  - Bottom sheet modal
  - Emoji category selection
  - Real-time amount input
  - Optional description

- **Design System**
  - Dark mode first
  - Purple/Pink gradient theme
  - Glass-morphism effects
  - Smooth micro-animations
  - Gen Z aesthetic

### 🚧 Upcoming Features

- **Insights Screen**
  - Monthly overview charts
  - Category breakdown visualizations
  - Spending trends

- **Goals Screen**
  - Progress bars with animations
  - "Level up" gamification
  - Deadline tracking

- **Desktop Dashboard**
  - Calm, premium design
  - More data density
  - Analytical views

## Available Scripts

```bash
# Development
npm run dev          # Start dev server

# Build
npm run build        # Build for production
npm run start        # Start production server

# Linting
npm run lint         # Run ESLint
```

## Database Schema

The app uses Supabase with the following tables:

- **profiles** - User profiles and settings
- **categories** - Expense categories (emoji-based)
- **expenses** - Individual expense records
- **goals** - Financial goals and targets
- **budgets** - Monthly category budgets

See `SUPABASE_SETUP.md` for the complete SQL schema.

## Design Philosophy

### Mobile (Primary)
- **Vibe**: Lifestyle app, not fintech
- **UX**: Thumb-first, one-hand usage, zero friction
- **Visual**: Dark mode, soft gradients, glass cards
- **Interaction**: Micro-animations, everything within 2 taps

### Desktop (Secondary)
- **Vibe**: Calm, premium, minimal
- **UX**: More breathing space, clear hierarchy
- **Visual**: Lighter gradients, typography-led
- **Purpose**: Review, patterns, planning

## Development Guidelines

1. **Mobile-First**: Always start with mobile design
2. **Performance**: Use lazy loading and optimize animations
3. **Accessibility**: Ensure proper touch targets (min 44px)
4. **Type Safety**: Use TypeScript strictly
5. **Animations**: Framer Motion for all interactions
6. **State**: Consider React Query for server state (future)

## Color Palette

```css
--primary: #8B5CF6      /* Purple */
--secondary: #EC4899    /* Pink */
--accent: #10B981       /* Green */
--warning: #F59E0B      /* Amber */
--danger: #EF4444       /* Red */
```

## Contributing

1. Create feature branches from `main`
2. Follow the existing code style
3. Test on mobile viewports first
4. Ensure animations are smooth (60fps)
5. Update types when changing schema

## Troubleshooting

### Supabase connection issues
- Check `.env.local` has correct values
- Restart dev server after env changes
- Verify Supabase project is active

### Animation performance
- Reduce motion in browser settings affects animations
- Check Chrome DevTools Performance tab
- Use `will-change` CSS property sparingly

### Build errors
- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npx tsc --noEmit`

## License

Private project - All rights reserved
