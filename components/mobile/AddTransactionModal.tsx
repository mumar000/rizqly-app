"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { useBanks } from "@/hooks/queries/useBanks";
import { useCategories } from "@/hooks/queries/useCategories";

export type Direction = "expense" | "income";

export interface AddTransactionInput {
  direction: Direction;
  amount: number;
  description: string;
  bankAccount: string;
  category: string;
  rawInput: string;
}

interface AddTransactionModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: AddTransactionInput) => void;
}

interface ChipOption {
  id: string;
  label: string;
  emoji: string;
  color: string;
}

const EXPENSE_FALLBACK: ChipOption[] = [
  { id: "Food", label: "Food", emoji: "🍔", color: "#FF6B6B" },
  { id: "Transport", label: "Transport", emoji: "🚕", color: "#4ECDC4" },
  { id: "Shopping", label: "Shopping", emoji: "🛍️", color: "#45B7D1" },
  { id: "Bills", label: "Bills", emoji: "📄", color: "#96CEB4" },
  { id: "Entertainment", label: "Fun", emoji: "🎬", color: "#FFEAA7" },
  { id: "Health", label: "Health", emoji: "💊", color: "#DDA0DD" },
  { id: "Groceries", label: "Groceries", emoji: "🛒", color: "#F7DC6F" },
  { id: "Other", label: "Other", emoji: "📦", color: "#BB8FCE" },
];

const INCOME_FALLBACK: ChipOption[] = [
  { id: "Salary", label: "Salary", emoji: "💼", color: "#22C55E" },
  { id: "Freelance / Gig", label: "Freelance", emoji: "🧠", color: "#06B6D4" },
  { id: "Transfer", label: "Transfer", emoji: "🔄", color: "#38BDF8" },
  { id: "Cash Deposit", label: "Deposit", emoji: "🏦", color: "#84CC16" },
  { id: "Refund", label: "Refund", emoji: "↩️", color: "#F59E0B" },
  { id: "Gift", label: "Gift", emoji: "🎁", color: "#EC4899" },
  { id: "Other", label: "Other", emoji: "✨", color: "#94A3B8" },
];

const BANK_FALLBACK: ChipOption[] = [
  { id: "meezan-bank", label: "Meezan Bank", emoji: "🏦", color: "#00A651" },
  { id: "hbl", label: "HBL", emoji: "💚", color: "#006341" },
  { id: "cash", label: "Cash", emoji: "💵", color: "#22C55E" },
];

const PRESETS = [100, 500, 1000, 5000, 10000];

const DIRECTION_KEY = "rizqly.lastAddDirection.v1";

const COLORS = {
  expense: {
    accent: "#FF7A8A",
    soft: "rgba(255,122,138,0.18)",
    softer: "rgba(255,122,138,0.08)",
    glow: "rgba(255,122,138,0.45)",
  },
  income: {
    accent: "#39FF14",
    soft: "rgba(57,255,20,0.18)",
    softer: "rgba(57,255,20,0.08)",
    glow: "rgba(57,255,20,0.45)",
  },
};

function loadLastDirection(): Direction {
  if (typeof window === "undefined") return "expense";
  try {
    const raw = window.localStorage.getItem(DIRECTION_KEY);
    return raw === "income" ? "income" : "expense";
  } catch {
    return "expense";
  }
}

function saveLastDirection(d: Direction) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DIRECTION_KEY, d);
  } catch {}
}

function vibrate(ms = 12) {
  if (typeof navigator === "undefined") return;
  try {
    navigator.vibrate?.(ms);
  } catch {}
}

function mapBankFromApi(b: { name?: string; icon_url?: string; color?: string }): ChipOption {
  const name = b.name?.trim() || "Account";
  return {
    id: name.toLowerCase().replace(/\s+/g, "-"),
    label: name,
    emoji: b.icon_url || "🏦",
    color: b.color || "#22C55E",
  };
}

function mapCategoryFromApi(c: { name?: string; emoji?: string; color?: string }): ChipOption {
  const name = c.name?.trim() || "Other";
  return {
    id: name,
    label: name,
    emoji: c.emoji || "📦",
    color: c.color || "#BDC3C7",
  };
}

export function AddTransactionModal({
  open,
  onClose,
  onSubmit,
}: AddTransactionModalProps) {
  const { data: bankData } = useBanks();
  const { data: categoryData } = useCategories();

  const [direction, setDirection] = useState<Direction>(() =>
    loadLastDirection(),
  );
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ChipOption | null>(
    null,
  );
  const [selectedBank, setSelectedBank] = useState<ChipOption | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const palette = COLORS[direction];

  // Build chip lists (API data when available, fallback otherwise).
  const expenseCategories = useMemo<ChipOption[]>(() => {
    if (categoryData && categoryData.length > 0) {
      return categoryData.map((c) =>
        mapCategoryFromApi(c as { name?: string; emoji?: string; color?: string }),
      );
    }
    return EXPENSE_FALLBACK;
  }, [categoryData]);

  const incomeCategories = INCOME_FALLBACK;

  const banks = useMemo<ChipOption[]>(() => {
    if (bankData && bankData.length > 0) {
      return (bankData as Array<{ name?: string; icon_url?: string; color?: string }>).map(
        mapBankFromApi,
      );
    }
    return BANK_FALLBACK;
  }, [bankData]);

  const categories =
    direction === "expense" ? expenseCategories : incomeCategories;

  // When opening: set sensible defaults.
  useEffect(() => {
    if (!open) return;
    setDirection(loadLastDirection());
    setSubmitted(false);
  }, [open]);

  // Keep category selection valid for the active direction.
  useEffect(() => {
    if (!open) return;
    setSelectedCategory((current) => {
      if (current && categories.some((c) => c.id === current.id)) return current;
      return categories[0] ?? null;
    });
  }, [direction, categories, open]);

  // Auto-pick first bank once data lands (only if none chosen yet).
  useEffect(() => {
    if (!open) return;
    setSelectedBank((current) => current ?? banks[0] ?? null);
  }, [open, banks]);

  // Esc to close.
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const dragY = useMotionValue(0);
  const backdropOpacity = useTransform(dragY, [0, 250], [1, 0.4]);

  const setDir = (d: Direction) => {
    if (d === direction) return;
    vibrate();
    setDirection(d);
    saveLastDirection(d);
  };

  const pressNum = (s: string) => {
    setAmount((prev) => {
      if (s === ".") {
        if (prev.includes(".")) return prev;
        if (!prev) return "0.";
        return prev + ".";
      }
      if (prev === "0") return s;
      if (prev.length >= 9) return prev;
      return prev + s;
    });
  };

  const pressBackspace = () => {
    setAmount((prev) => prev.slice(0, -1));
  };

  const setPreset = (n: number) => {
    vibrate(8);
    setAmount(String(n));
  };

  const reset = () => {
    setAmount("");
    setDescription("");
    setSubmitted(false);
  };

  const handleClose = () => {
    onClose();
    setTimeout(reset, 250);
  };

  const canSubmit =
    !!selectedBank && !!selectedCategory && parseFloat(amount) > 0;

  const handleSubmit = () => {
    if (!canSubmit || !selectedBank || !selectedCategory) return;
    const amt = parseFloat(amount);
    const desc = description.trim() || selectedCategory.label;
    onSubmit({
      direction,
      amount: amt,
      description: desc,
      bankAccount: selectedBank.label,
      category: selectedCategory.id,
      rawInput: `${amt} ${selectedCategory.id} ${selectedBank.label}`,
    });
    setSubmitted(true);
    setTimeout(handleClose, 650);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[70] flex justify-center items-end sm:items-center px-0 sm:px-4"
        >
          {/* Backdrop */}
          <motion.button
            type="button"
            aria-label="Close"
            onClick={handleClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            style={{ opacity: backdropOpacity }}
          />

          {/* Modal */}
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 34 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            dragMomentum={false}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120 || info.velocity.y > 500) handleClose();
            }}
            className="relative w-full sm:max-w-md max-h-[92vh] overflow-y-auto rounded-t-[32px] sm:rounded-[32px] sm:my-4"
            style={{
              y: dragY,
              background: "#15161F",
              border: "1px solid rgba(255,255,255,0.06)",
              boxShadow: "0 -10px 60px rgba(0,0,0,0.6)",
            }}
          >
            {/* Top glow */}
            <div
              aria-hidden
              className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[420px] h-[260px] rounded-full blur-3xl"
              style={{ background: palette.softer }}
            />

            {/* Drag handle */}
            <div className="relative flex justify-center pt-3 pb-2">
              <div className="h-1.5 w-12 rounded-full bg-white/15" />
            </div>

            <div className="relative px-5 pb-6">
              {/* Direction toggle */}
              <DirectionToggle direction={direction} onChange={setDir} />

              {/* Amount hero */}
              <AmountHero
                amount={amount}
                accent={palette.accent}
                glow={palette.glow}
              />

              {/* Preset chips */}
              <div className="mt-4 flex gap-2 overflow-x-auto no-scrollbar -mx-5 px-5">
                {PRESETS.map((p) => (
                  <PresetChip
                    key={p}
                    value={p}
                    onClick={() => setPreset(p)}
                    accent={palette.accent}
                    soft={palette.soft}
                  />
                ))}
              </div>

              {/* Description */}
              <div className="mt-4">
                <div
                  className="flex items-center gap-2 px-4 py-3 rounded-2xl"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <span className="text-base flex-shrink-0">
                    {description ? "💬" : "✨"}
                  </span>
                  <input
                    value={description}
                    maxLength={48}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={
                      direction === "income"
                        ? "What came in? (optional)"
                        : "What was it for? (optional)"
                    }
                    className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-white/30 font-medium"
                  />
                </div>
              </div>

              {/* Category */}
              <Section title={direction === "income" ? "Source" : "Category"}>
                <ChipRow
                  options={categories}
                  selectedId={selectedCategory?.id ?? null}
                  onSelect={setSelectedCategory}
                />
              </Section>

              {/* Bank */}
              <Section
                title={direction === "income" ? "Deposit to" : "Pay from"}
              >
                {banks.length === 0 ? (
                  <p className="text-xs text-white/40">
                    Add a bank account first.
                  </p>
                ) : (
                  <ChipRow
                    options={banks}
                    selectedId={selectedBank?.id ?? null}
                    onSelect={setSelectedBank}
                  />
                )}
              </Section>

              {/* Numpad */}
              <div className="mt-5 grid grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                  <NumKey key={n} onClick={() => pressNum(String(n))}>
                    {n}
                  </NumKey>
                ))}
                <NumKey onClick={() => pressNum(".")}>.</NumKey>
                <NumKey onClick={() => pressNum("0")}>0</NumKey>
                <NumKey onClick={pressBackspace} aria="Backspace">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
                    <line x1="18" y1="9" x2="12" y2="15" />
                    <line x1="12" y1="9" x2="18" y2="15" />
                  </svg>
                </NumKey>
              </div>

              {/* CTA */}
              <motion.button
                whileTap={{ scale: canSubmit ? 0.97 : 1 }}
                onClick={handleSubmit}
                disabled={!canSubmit || submitted}
                className="mt-5 w-full rounded-2xl py-3.5 font-extrabold text-sm disabled:opacity-40"
                style={{
                  background: canSubmit
                    ? `linear-gradient(135deg, ${palette.accent} 0%, ${palette.accent}cc 100%)`
                    : "rgba(255,255,255,0.08)",
                  color: canSubmit ? "#0F0F11" : "rgba(255,255,255,0.4)",
                  boxShadow: canSubmit
                    ? `0 10px 30px -8px ${palette.glow}`
                    : "none",
                }}
              >
                {submitted
                  ? "✓ Added"
                  : direction === "income"
                    ? "Add income"
                    : "Add expense"}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------- Sub-components ---------- */

function DirectionToggle({
  direction,
  onChange,
}: {
  direction: Direction;
  onChange: (d: Direction) => void;
}) {
  return (
    <div
      className="relative rounded-full p-1 flex"
      style={{
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {(["expense", "income"] as Direction[]).map((d) => {
        const active = d === direction;
        const palette = COLORS[d];
        return (
          <button
            key={d}
            onClick={() => onChange(d)}
            className="relative flex-1 py-2.5 rounded-full text-xs font-extrabold flex items-center justify-center gap-1.5 z-10"
            style={{
              color: active ? "#0F0F11" : "rgba(255,255,255,0.5)",
              transition: "color 0.15s",
            }}
          >
            {active && (
              <motion.span
                layoutId="add-direction-pill"
                className="absolute inset-0 rounded-full"
                style={{ background: palette.accent }}
                transition={{ type: "spring", stiffness: 480, damping: 32 }}
              />
            )}
            <span className="relative">
              {d === "expense" ? "💸" : "💰"}
            </span>
            <span className="relative">
              {d === "expense" ? "Expense" : "Income"}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function AmountHero({
  amount,
  accent,
  glow,
}: {
  amount: string;
  accent: string;
  glow: string;
}) {
  const display = amount || "0";
  return (
    <div className="mt-5 text-center">
      <p className="text-[10px] font-extrabold tracking-[0.25em] uppercase text-white/40">
        Amount
      </p>
      <div className="mt-1 flex items-baseline justify-center gap-2">
        <span className="text-base text-white/30 font-extrabold">Rs</span>
        <motion.span
          key={display}
          initial={{ scale: 1.12, opacity: 0.6 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.14, ease: "easeOut" }}
          className="text-[44px] leading-none font-extrabold tracking-tight"
          style={{
            color: amount ? accent : "rgba(255,255,255,0.2)",
            textShadow: amount ? `0 0 28px ${glow}` : "none",
          }}
        >
          {display}
        </motion.span>
      </div>
    </div>
  );
}

function PresetChip({
  value,
  onClick,
  accent,
  soft,
}: {
  value: number;
  onClick: () => void;
  accent: string;
  soft: string;
}) {
  const label = value >= 1000 ? `${value / 1000}k` : String(value);
  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      className="flex-shrink-0 rounded-full px-3.5 py-1.5 text-xs font-extrabold whitespace-nowrap"
      style={{
        background: soft,
        color: accent,
        border: `1px solid ${accent}44`,
      }}
    >
      {label}
    </motion.button>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-5">
      <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-white/40 mb-2 px-1">
        {title}
      </p>
      {children}
    </div>
  );
}

function ChipRow({
  options,
  selectedId,
  onSelect,
}: {
  options: ChipOption[];
  selectedId: string | null;
  onSelect: (o: ChipOption) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-5 px-5 pb-1">
      {options.map((o) => {
        const active = o.id === selectedId;
        return (
          <motion.button
            key={o.id}
            whileTap={{ scale: 0.93 }}
            onClick={() => onSelect(o)}
            className="flex-shrink-0 rounded-2xl flex items-center gap-2 px-3 py-2 text-xs font-extrabold whitespace-nowrap"
            style={{
              background: active
                ? `linear-gradient(135deg, ${o.color}33 0%, ${o.color}10 100%)`
                : "rgba(255,255,255,0.04)",
              border: `1.5px solid ${active ? o.color : "rgba(255,255,255,0.06)"}`,
              color: active ? "#fff" : "rgba(255,255,255,0.55)",
              boxShadow: active ? `0 0 18px -6px ${o.color}aa` : "none",
            }}
          >
            <span className="text-base">{o.emoji}</span>
            {o.label}
          </motion.button>
        );
      })}
    </div>
  );
}

function NumKey({
  children,
  onClick,
  aria,
}: {
  children: React.ReactNode;
  onClick: () => void;
  aria?: string;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      aria-label={aria}
      className="h-12 sm:h-11 rounded-2xl flex items-center justify-center text-xl font-bold text-white"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {children}
    </motion.button>
  );
}
