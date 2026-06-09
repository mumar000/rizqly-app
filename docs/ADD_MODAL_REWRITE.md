# Unified Add Modal + Login Cleanup — Plan

> Drafted before coding so nothing slips. Four scoped changes.

---

## 1. Unified Add Transaction Modal

### Why
Today the bottom-nav FAB opens an **expand picker** (Add Expense / Add Money) → tapping one of those opens a *different* sheet. Two sheets, two duplicated code paths, two interaction steps.

### Goal
One modal. User picks direction **inside** it via a segmented toggle. Same flow, half the code, more polish.

### New component: `components/mobile/AddTransactionModal.tsx`

```
┌──────────────────────────────────────┐
│             ▔▔ drag handle           │   <- drag down to dismiss
│                                      │
│   ┌──────────────┬──────────────┐    │   <- segmented toggle (animated layoutId pill)
│   │  💸 Expense  │  💰 Income   │    │      red side ↔ green side
│   └──────────────┴──────────────┘    │
│                                      │
│           Rs.   12,450               │   <- amount hero, color = direction
│                                      │      pulses on keypress
│                                      │
│   [100]  [500]  [1k]  [5k]  [10k]    │   <- quick-add preset chips
│                                      │
│   💬  What was it for? (optional)    │   <- description input
│                                      │
│   CATEGORY                           │
│   [🍔 Food] [🚕 Transport] ...       │   <- chip row (swaps by direction)
│                                      │
│   PAY FROM                           │
│   [🏦 Meezan] [💵 Cash] ...          │   <- bank chips
│                                      │
│   ┌──────────────────────────────┐   │
│   │  1   2   3                   │   │   <- numpad
│   │  4   5   6                   │   │
│   │  7   8   9                   │   │
│   │  .   0   ⌫                   │   │
│   └──────────────────────────────┘   │
│                                      │
│   [    Add Expense    ]              │   <- CTA, gradient = direction
└──────────────────────────────────────┘
```

### Interactions

| Action | Behavior |
|---|---|
| Drag down on sheet | Velocity > 500 OR offset > 120 → close with spring |
| Backdrop tap | Close |
| Esc key | Close |
| Tap direction tab | Switch direction; `layoutId` pill slides; haptic tick (`navigator.vibrate(15)`) |
| Swipe LEFT/RIGHT on toggle area | Switch direction (alternative to tap) |
| Tap preset chip (100/500/…) | Set amount instantly (replaces current) |
| Tap numpad | Append digit; amount text scale-pulses |
| Hold ⌫ for 600ms | Clear amount to 0 (defer if too much) |
| Submit | Disabled until amount > 0 and bank selected; success toast then close |

### State

```ts
const [direction, setDirection] = useState<"expense" | "income">(initialDirection ?? "expense");
const [amount, setAmount]       = useState("");
const [description, setDescription] = useState("");
const [category, setCategory]   = useState<ChipOption>(...);
const [bank, setBank]           = useState<ChipOption | null>(null);
const [showSuccess, setShowSuccess] = useState(false);
```

- When `direction` flips, `category` resets to the first option of the new list.
- When the modal opens with no bank, auto-pick first available from `useBanks()`.

### Props

```ts
interface AddTransactionModalProps {
  open: boolean;
  initialDirection?: "expense" | "income";
  onClose: () => void;
  onSubmit: (data: {
    direction: "expense" | "income";
    amount: number;
    description: string;
    bankAccount: string;
    category: string;
    rawInput: string;
  }) => void;
}
```

### Hooks reused
- `useBanks` → bank chip data
- `useCategories` → expense categories (income uses local `INCOME_CATEGORIES` constant, matching existing AddIncomeSheet)

### Color tokens
- **Expense**: amount + CTA in coral `#FF7A8A`; toggle pill bg `rgba(255,122,138,0.18)`
- **Income**: amount + CTA in neon green `#39FF14`; toggle pill bg `rgba(57,255,20,0.18)`

---

## 2. Smoothness & drag-to-close

### Drag physics
```ts
drag="y"
dragConstraints={{ top: 0, bottom: 0 }}
dragElastic={{ top: 0, bottom: 0.5 }}
dragMomentum={false}
onDragEnd={(_, info) => {
  if (info.offset.y > 120 || info.velocity.y > 500) onClose();
}}
```

### Mount/unmount
```ts
initial={{ y: "100%" }}
animate={{ y: 0 }}
exit={{ y: "100%" }}
transition={{ type: "spring", stiffness: 380, damping: 34 }}
```

### Backdrop
- Fades in 150ms, blurs background.
- Click closes.

### Toggle pill animation
- Use `layoutId="direction-pill"` so the highlight slides between Expense / Income cells over ~180ms spring.

### Amount pulse
- `motion.span` keyed by `amount` value → `initial={{scale: 1.12}} animate={{scale: 1}}` for a subtle bounce on each keypress.

### Direction swap visual
- Amount color and CTA gradient animate to new direction color via `style` + framer's automatic style interpolation.

---

## 3. Responsive

### Problem
Current sheet always pins to bottom and stretches full-width. On tablet/desktop that looks awkward — a 1200px-wide bottom sheet.

### Solution
- **Mobile (`< sm`)**: bottom sheet, full width, rounded top corners only.
- **≥ sm (640px+)**: floating centered card — `max-w-md mx-auto`, all corners rounded `[32px]`, dropped from the **center** instead of from the bottom. Backdrop centered.

### Strategy
- Outer wrapper: `fixed inset-0 z-50 flex justify-center items-end sm:items-center px-0 sm:px-4`
- Modal container: `w-full sm:max-w-md rounded-t-[32px] sm:rounded-[32px]`
- Drag direction stays vertical on both (drag-down to close still feels natural even on desktop).

### Internal scrolling
- `max-h-[92vh] overflow-y-auto` so on short viewports it scrolls instead of clipping.
- Numpad/CTA always fit because the description + chip rows compress before scroll kicks in.

### Touch targets
- Buttons stay at `min-h-12` on mobile, `min-h-11` on `sm:` and up.

---

## 4. BottomNav rewrite

### Current (delete this whole flow)
```
FAB → setShowActions(true)
  → "Add Expense" card → setShowExpenseSheet(true) → QuickExpenseInput
  → "Add Money" card → setShowIncomeSheet(true) → AddIncomeSheet
```

### New
```
FAB → setAddOpen(true) → AddTransactionModal
```

Removes:
- `showActions` state + the floating mini-card with two big buttons
- Both `setShowExpenseSheet` / `setShowIncomeSheet` paths
- Imports of `QuickExpenseInput` and `AddIncomeSheet`

Adds:
- `useState` for the single open flag
- `AddTransactionModal` import + mount
- One `onSubmit` handler that routes to `addExpense` or `addIncome` based on `data.direction`

### Files left orphaned (not deleting in this PR)
- `components/mobile/QuickExpenseInput.tsx`
- `components/mobile/AddIncomeSheet.tsx`
- `components/mobile/AddExpenseModal.tsx`

These have no remaining importers after the swap. Safe to delete in a cleanup PR; leaving them now keeps the diff focused on the rewrite.

---

## 5. Login screen cleanup (`app/auth/page.tsx`)

### Remove
- `FLOATING_EMOJIS` array + the `FLOATING_EMOJI_POSITIONS` array
- The `motion.div` loop rendering all eight floating emojis
- The two background blob glows (purple top-left, lime bottom-right)
- The 💸 emoji inside the gradient logo square
- The 🚫 prefix on the error message

### Keep
- "RIZQLY" wordmark
- "Level up your finance game" tagline
- Glass card containing Google sign-in button
- Google logo SVG (it's the brand mark — not decoration)
- Error display (text only, no emoji)
- Footer micro-text

### Result
Pure dark-mode page, centered card, Google CTA. No emojis. No floating shapes. No glows.

### Edge cases
- Loading spinner stays (functional, not decorative)
- `useEffect` redirect on `user` unchanged

---

## Files this touches

### New
- `components/mobile/AddTransactionModal.tsx`

### Modified
- `components/mobile/BottomNav.tsx` (rip expand-picker + old sheet mounts; mount new modal)
- `app/auth/page.tsx` (strip decorative emojis + glows)

### Untouched but orphaned
- `components/mobile/QuickExpenseInput.tsx`
- `components/mobile/AddIncomeSheet.tsx`
- `components/mobile/AddExpenseModal.tsx`

---

## Verification checklist (when done)

- [ ] `npx tsc --noEmit` clean
- [ ] Tap FAB → modal slides in from bottom (mobile) / center (desktop)
- [ ] Toggle pill animates between Expense/Income; colors swap on amount + CTA
- [ ] Numpad fills amount; preset chips fill instantly
- [ ] Description optional; submit disabled when amount = 0 or no bank
- [ ] Submit calls correct mutation (`addExpense` vs `addIncome`)
- [ ] Drag down ≥120px or fast flick closes
- [ ] Backdrop tap and Esc both close
- [ ] Resize browser to desktop width → modal becomes centered card, not edge-to-edge
- [ ] `/auth` page has zero emojis and no animated background shapes
- [ ] Optimistic update from existing mutations still works
- [ ] No console errors / warnings

---

## Open question

**Direction toggle scope**: Should there be a memory of last-used direction, or always default to Expense? Plan says `initialDirection ?? "expense"` — straightforward. If you want "remember last", I'd persist it to localStorage. Tiny addition; ask if you want it before I code.
