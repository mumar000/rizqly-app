'use client';

import { useState } from 'react';

export const dynamic = 'force-dynamic';
import { LiquidBalance } from '@/components/mobile/LiquidBalance';
import { AddExpenseModal } from '@/components/mobile/AddExpenseModal';
import { motion } from 'framer-motion';

export default function HomePage() {
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  // Auth bypassed for design work

  // Mock data
  const mockData = {
    balance: 420,
    transactions: [
      { icon: '🎧', title: 'Spotify', category: 'Subscription', amount: -12, time: '2h ago' },
      { icon: '🍔', title: 'Uber Eats', category: 'Food & Drink', amount: -24, time: '5h ago' },
      { icon: '☕️', title: 'Starbucks', category: 'Coffee', amount: -8, time: '1d ago' },
      { icon: '🚕', title: 'Uber', category: 'Transport', amount: -15, time: '1d ago' },
      { icon: '🎬', title: 'Netflix', category: 'Subscription', amount: -16, time: '2d ago' },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col relative" style={{ backgroundColor: '#0F0F11' }}>
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 pt-8 pb-2 flex items-center justify-between"
      >
        <div>
          <p className="text-[#8F90A6] text-sm">Good evening</p>
          <h1 className="text-xl font-semibold">Alex 👋</h1>
        </div>
        <div
          className="w-10 h-10 rounded-full"
          style={{
            background: 'linear-gradient(135deg, #FF6B6B, #CCFF00)',
            border: '2px solid #0F0F11',
          }}
        />
      </motion.header>

      {/* Hero Balance Section */}
      <div className="flex-1 flex items-center justify-center">
        <LiquidBalance balance={mockData.balance} />
      </div>

      {/* Transaction Stream */}
      <div className="px-6 pb-32">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-between mb-4"
        >
          <h2 className="text-lg font-semibold">Latest Flow</h2>
          <button className="text-[#CCFF00] text-sm font-medium">See All</button>
        </motion.div>

        <div className="space-y-3 max-h-64 overflow-y-auto">
          {mockData.transactions.map((transaction, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="glass rounded-[20px] p-4 flex items-center justify-between"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-11 h-11 rounded-[14px] flex items-center justify-center text-2xl"
                  style={{ background: 'rgba(255, 255, 255, 0.1)' }}
                >
                  {transaction.icon}
                </div>
                <div>
                  <h4 className="font-semibold text-base">{transaction.title}</h4>
                  <span className="text-sm text-[#8F90A6]">{transaction.category}</span>
                </div>
              </div>
              <div className="font-bold text-base">
                {transaction.amount < 0 ? '-' : '+'}${Math.abs(transaction.amount)}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Floating Nav Dock */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-md h-[70px] rounded-[25px] flex items-center justify-around"
        style={{
          background: 'rgba(22, 22, 24, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
        }}
      >
        <button className="text-white text-2xl">🏠</button>

        {/* Add Button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowExpenseModal(true)}
          className="w-[60px] h-[60px] rounded-full flex items-center justify-center text-black text-4xl font-light -mt-8"
          style={{
            background: '#CCFF00',
            border: '4px solid #0F0F11',
            boxShadow: '0 0 20px rgba(204, 255, 0, 0.4)',
          }}
        >
          +
        </motion.button>

        <button className="text-[#8F90A6] text-2xl">📊</button>
      </motion.div>

      {/* Add Expense Modal */}
      <AddExpenseModal
        open={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
      />
    </div>
  );
}
