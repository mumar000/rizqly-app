'use client';

import { motion } from 'framer-motion';

interface BalanceCardProps {
  balance: number;
  income: number;
  expenses: number;
}

export function BalanceCard({ balance, income, expenses }: BalanceCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl p-6 glass animate-glow"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-pink-600/20 pointer-events-none" />

      <div className="relative z-10">
        <p className="text-gray-400 text-sm font-medium mb-2">Total Balance</p>
        <motion.h1
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="text-5xl font-bold mb-6 gradient-text"
        >
          {formatCurrency(balance)}
        </motion.h1>

        {/* Income & Expenses */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-green-400 text-xl">↓</span>
              <p className="text-gray-400 text-xs font-medium">Income</p>
            </div>
            <p className="text-green-400 text-lg font-semibold">
              {formatCurrency(income)}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-pink-500/10 border border-pink-500/20 rounded-2xl p-4"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-pink-400 text-xl">↑</span>
              <p className="text-gray-400 text-xs font-medium">Expenses</p>
            </div>
            <p className="text-pink-400 text-lg font-semibold">
              {formatCurrency(expenses)}
            </p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
