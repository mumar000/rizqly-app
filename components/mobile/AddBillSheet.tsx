"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useBanks } from "@/hooks/queries/useBanks";
import { useAddBill } from "@/hooks/mutations/useAddBill";
import type { BillFrequency } from "@/services/bill.service";

interface AddBillSheetProps {
  open: boolean;
  onClose: () => void;
}

interface ChipOption {
  id: string;
  label: string;
  emoji: string;
}

const FREQUENCIES: { id: BillFrequency; label: string; emoji: string }[] = [
  { id: "monthly", label: "Monthly", emoji: "🗓️" },
  { id: "weekly", label: "Weekly", emoji: "📅" },
  { id: "yearly", label: "Yearly", emoji: "🎂" },
  { id: "one_off", label: "One-off", emoji: "📌" },
];

const CATEGORIES: ChipOption[] = [
  { id: "Rent", label: "Rent", emoji: "🏠" },
  { id: "Subscription", label: "Subs", emoji: "🎬" },
  { id: "Internet", label: "Internet", emoji: "🌐" },
  { id: "Utilities", label: "Utilities", emoji: "💡" },
  { id: "Phone", label: "Phone", emoji: "📱" },
  { id: "Insurance", label: "Insurance", emoji: "🛡️" },
  { id: "Education", label: "Education", emoji: "📚" },
  { id: "Other", label: "Other", emoji: "🧾" },
];

function todayIso() {
  return new Date().toISOString().split("T")[0];
}

function plusDaysIso(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

export function AddBillSheet({ open, onClose }: AddBillSheetProps) {
  const { data: bankData = [] } = useBanks();
  const addBill = useAddBill();

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState<BillFrequency>("monthly");
  const [category, setCategory] = useState<ChipOption>(CATEGORIES[0]);
  const [bank, setBank] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>(plusDaysIso(7));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (!bank && bankData.length > 0) {
      const first = (bankData[0] as { name?: string }).name;
      if (first) setBank(first);
    }
  }, [open, bankData, bank]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const reset = () => {
    setName("");
    setAmount("");
    setFrequency("monthly");
    setCategory(CATEGORIES[0]);
    setDueDate(plusDaysIso(7));
    setError(null);
  };

  const submit = () => {
    setError(null);
    const amt = Number(amount);
    if (!name.trim()) return setError("Give it a name");
    if (!amt || amt <= 0) return setError("Enter an amount");
    if (!bank) return setError("Pick a bank");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) return setError("Pick a due date");

    addBill.mutate(
      {
        name: name.trim(),
        amount: amt,
        category: category.id,
        bankAccount: bank,
        frequency,
        nextDueDate: dueDate,
        reminderEnabled: true,
      },
      {
        onSuccess: () => {
          reset();
          onClose();
        },
        onError: (err) => setError(err.message),
      },
    );
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 420, damping: 38 }}
            className="fixed inset-x-0 bottom-0 z-50 rounded-t-[32px] px-5 pb-8 pt-3"
            style={{
              background: "#15161F",
              borderTop: "1px solid rgba(255,255,255,0.06)",
              maxHeight: "92vh",
              overflowY: "auto",
            }}
          >
            <div className="flex justify-center pb-3">
              <div className="h-1.5 w-12 rounded-full bg-white/15" />
            </div>

            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[10px] font-extrabold tracking-[0.25em] uppercase text-white/40">
                  New bill
                </p>
                <h2 className="text-xl font-extrabold text-white mt-0.5">
                  Track what’s coming
                </h2>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full flex items-center justify-center text-white/60 text-sm"
                style={{ background: "rgba(255,255,255,0.06)" }}
              >
                ✕
              </button>
            </div>

            {/* Name + Amount */}
            <div className="space-y-3">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name (Rent, Netflix…)"
                className="w-full rounded-2xl bg-white/5 px-4 py-3.5 text-sm text-white placeholder:text-white/30 outline-none font-bold"
              />
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 text-sm font-extrabold">
                  Rs.
                </span>
                <input
                  inputMode="numeric"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
                  placeholder="0"
                  className="w-full rounded-2xl bg-white/5 pl-12 pr-4 py-3.5 text-base text-white placeholder:text-white/30 outline-none font-extrabold"
                />
              </div>
            </div>

            {/* Frequency */}
            <Section title="How often">
              <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-5 px-5">
                {FREQUENCIES.map((f) => (
                  <Chip
                    key={f.id}
                    selected={frequency === f.id}
                    onClick={() => setFrequency(f.id)}
                  >
                    <span>{f.emoji}</span>
                    {f.label}
                  </Chip>
                ))}
              </div>
            </Section>

            {/* Category */}
            <Section title="Category">
              <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-5 px-5">
                {CATEGORIES.map((c) => (
                  <Chip
                    key={c.id}
                    selected={category.id === c.id}
                    onClick={() => setCategory(c)}
                  >
                    <span>{c.emoji}</span>
                    {c.label}
                  </Chip>
                ))}
              </div>
            </Section>

            {/* Bank */}
            <Section title="Pay from">
              {bankData.length === 0 ? (
                <p className="text-xs text-white/40">
                  Add a bank account first.
                </p>
              ) : (
                <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-5 px-5">
                  {(bankData as Array<{ name: string }>).map((b) => (
                    <Chip
                      key={b.name}
                      selected={bank === b.name}
                      onClick={() => setBank(b.name)}
                    >
                      <span>🏦</span>
                      {b.name}
                    </Chip>
                  ))}
                </div>
              )}
            </Section>

            {/* Due date */}
            <Section title="Next due">
              <div className="flex gap-2 mb-2">
                {[
                  { label: "Today", iso: todayIso() },
                  { label: "+3d", iso: plusDaysIso(3) },
                  { label: "+7d", iso: plusDaysIso(7) },
                  { label: "+30d", iso: plusDaysIso(30) },
                ].map((p) => (
                  <Chip
                    key={p.label}
                    selected={dueDate === p.iso}
                    onClick={() => setDueDate(p.iso)}
                  >
                    {p.label}
                  </Chip>
                ))}
              </div>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-2xl bg-white/5 px-4 py-3 text-sm text-white outline-none font-bold"
              />
            </Section>

            {error && (
              <p
                className="mt-3 text-sm font-bold"
                style={{ color: "#FF7A8A" }}
              >
                {error}
              </p>
            )}

            <button
              onClick={submit}
              disabled={addBill.isPending}
              className="mt-5 w-full rounded-2xl py-3.5 font-extrabold text-black text-sm disabled:opacity-40"
              style={{ background: "#CCFF00" }}
            >
              {addBill.isPending ? "Saving…" : "Save bill"}
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
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
      <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-white/40 mb-2">
        {title}
      </p>
      {children}
    </div>
  );
}

function Chip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="flex-shrink-0 rounded-full px-3.5 py-2 text-xs font-extrabold inline-flex items-center gap-1.5 whitespace-nowrap"
      style={{
        background: selected ? "rgba(204,255,0,0.16)" : "rgba(255,255,255,0.05)",
        color: selected ? "#CCFF00" : "#fff",
        border: `1px solid ${
          selected ? "rgba(204,255,0,0.35)" : "rgba(255,255,255,0.07)"
        }`,
      }}
    >
      {children}
    </button>
  );
}
