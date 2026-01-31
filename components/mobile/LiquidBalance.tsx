'use client';

import { motion } from 'framer-motion';

interface LiquidBalanceProps {
  balance: number;
}

export function LiquidBalance({ balance }: LiquidBalanceProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="flex items-center justify-center py-16">
      {/* Liquid Wrapper */}
      <div className="relative w-64 h-64 flex items-center justify-center">
        {/* Liquid Blob 1 */}
        <div
          className="absolute w-full h-full opacity-20"
          style={{
            background: 'radial-gradient(circle at 30% 30%, rgba(204, 255, 0, 0.15), rgba(204, 255, 0, 0.05), transparent)',
            borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%',
            filter: 'blur(10px)',
            animation: 'morph 8s ease-in-out infinite',
          }}
        />

        {/* Liquid Blob 2 */}
        <div
          className="absolute w-[90%] h-[90%] opacity-30"
          style={{
            background: 'radial-gradient(circle at 70% 70%, rgba(26, 27, 46, 0.5), transparent)',
            borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%',
            filter: 'blur(10px)',
            animation: 'morph 8s ease-in-out infinite reverse',
          }}
        />

        {/* Balance Info */}
        <motion.div
          className="relative z-10 text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-[#8F90A6] text-sm uppercase tracking-wider mb-2">
            Safe to Spend
          </p>
          <motion.h1
            className="text-6xl font-extrabold gradient-text"
            style={{ letterSpacing: '-2px' }}
            whileTap={{ scale: 1.1 }}
          >
            {formatCurrency(balance)}
          </motion.h1>
        </motion.div>
      </div>
    </div>
  );
}
