'use client';

import { motion } from 'framer-motion';

interface SpendRingProps {
  category: string;
  emoji: string;
  spent: number;
  budget: number;
  color: string;
}

export function SpendRing({ category, emoji, spent, budget, color }: SpendRingProps) {
  const percentage = Math.min((spent / budget) * 100, 100);
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      whileTap={{ scale: 0.95 }}
      className="flex flex-col items-center gap-2 cursor-pointer"
    >
      {/* Ring */}
      <div className="relative w-24 h-24">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="8"
          />
          {/* Progress circle */}
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: 'easeInOut' }}
          />
        </svg>

        {/* Emoji in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl">{emoji}</span>
        </div>
      </div>

      {/* Category info */}
      <div className="text-center">
        <p className="text-white font-medium text-sm">{category}</p>
        <p className="text-gray-400 text-xs">
          {formatCurrency(spent)} / {formatCurrency(budget)}
        </p>
      </div>
    </motion.div>
  );
}

interface SpendRingsProps {
  categories: Array<{
    category: string;
    emoji: string;
    spent: number;
    budget: number;
    color: string;
  }>;
}

export function SpendRings({ categories }: SpendRingsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="mt-6"
    >
      <h2 className="text-xl font-bold mb-4">This Week</h2>
      <div className="grid grid-cols-3 gap-4">
        {categories.map((cat, index) => (
          <motion.div
            key={cat.category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + index * 0.1 }}
          >
            <SpendRing {...cat} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
