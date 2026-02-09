"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  parseExpense,
  CATEGORY_EMOJIS,
  formatPKR,
} from "@/utils/expenseParser";

interface NaturalExpenseInputProps {
  onExpenseAdded: (expense: {
    amount: number;
    description: string;
    bankAccount: string;
    category: string;
    rawInput: string;
  }) => void;
}

export function NaturalExpenseInput({
  onExpenseAdded,
}: NaturalExpenseInputProps) {
  const [input, setInput] = useState("");
  const [preview, setPreview] = useState<ReturnType<typeof parseExpense>>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Parse input as user types
  useEffect(() => {
    const parsed = parseExpense(input);
    setPreview(parsed);
  }, [input]);

  const handleSubmit = () => {
    if (!preview) return;

    onExpenseAdded({
      amount: preview.amount,
      description: preview.description,
      bankAccount: preview.bankAccount,
      category: preview.category,
      rawInput: preview.rawInput,
    });

    setInput("");
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && preview) {
      handleSubmit();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      {/* Input Container */}
      <motion.div
        animate={{
          scale: isFocused ? 1.02 : 1,
          boxShadow: isFocused
            ? "0 0 30px rgba(204, 255, 0, 0.15)"
            : "0 4px 20px rgba(0,0,0,0.3)",
        }}
        className="relative rounded-[20px] overflow-hidden"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)",
          border: `1px solid ${isFocused ? "rgba(204, 255, 0, 0.3)" : "rgba(255,255,255,0.1)"}`,
        }}
      >
        {/* Main Input */}
        <div className="flex items-center px-4 py-4">
          <motion.span
            animate={{ rotate: isFocused ? 15 : 0 }}
            className="text-2xl mr-3"
          >
            💸
          </motion.span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder="500rs ice cream from meezan..."
            className="flex-1 bg-transparent text-white text-lg placeholder:text-white/30 focus:outline-none"
          />
          {input && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setInput("")}
              className="text-white/40 hover:text-white/60 p-1"
            >
              ✕
            </motion.button>
          )}
        </div>

        {/* Live Preview */}
        <AnimatePresence>
          {preview && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-t border-white/10"
            >
              <div className="p-4 space-y-3">
                {/* Parsed Info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {CATEGORY_EMOJIS[preview.category]}
                    </span>
                    <div>
                      <div className="text-white font-medium">
                        {preview.description}
                      </div>
                      <div className="text-white/40 text-sm">
                        {preview.category}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[#CCFF00] font-bold text-xl">
                      -{formatPKR(preview.amount)}
                    </div>
                    <div className="text-white/40 text-xs flex items-center gap-1">
                      <span>🏦</span> {preview.bankAccount}
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit}
                  className="w-full py-3 rounded-xl font-bold text-black uppercase tracking-wide"
                  style={{
                    background: "#CCFF00",
                    boxShadow: "0 0 20px rgba(204, 255, 0, 0.3)",
                  }}
                >
                  Add Expense 🚀
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Success Toast */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full flex items-center gap-2 z-50"
            style={{
              background: "linear-gradient(135deg, #CCFF00 0%, #99CC00 100%)",
              boxShadow: "0 10px 40px rgba(204, 255, 0, 0.4)",
            }}
          >
            <span className="text-xl">✨</span>
            <span className="text-black font-bold">Expense Added!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Helper Text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-white/30 text-center text-xs mt-3"
      >
        Try: &quot;1200rs pizza from hbl&quot; or &quot;500 coffee
        jazzcash&quot;
      </motion.p>
    </motion.div>
  );
}
