'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Dialog from '@radix-ui/react-dialog';

interface Category {
  id: string;
  name: string;
  emoji: string;
  color: string;
}

const defaultCategories: Category[] = [
  { id: '1', name: 'Food', emoji: '🍔', color: '#FF6B6B' },
  { id: '2', name: 'Transport', emoji: '🚗', color: '#4ECDC4' },
  { id: '3', name: 'Shopping', emoji: '🛍️', color: '#FFE66D' },
  { id: '4', name: 'Entertainment', emoji: '🎮', color: '#A8E6CF' },
  { id: '5', name: 'Bills', emoji: '📱', color: '#FF8B94' },
  { id: '6', name: 'Health', emoji: '💊', color: '#95E1D3' },
  { id: '7', name: 'Education', emoji: '📚', color: '#C7CEEA' },
  { id: '8', name: 'Other', emoji: '💰', color: '#FFDAC1' },
];

interface AddExpenseModalProps {
  open: boolean;
  onClose: () => void;
}

export function AddExpenseModal({ open, onClose }: AddExpenseModalProps) {
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!amount || !selectedCategory) return;

    setIsSubmitting(true);

    // TODO: Save to Supabase
    setTimeout(() => {
      console.log({
        amount: parseFloat(amount),
        category: selectedCategory,
        description,
        date: new Date(),
      });

      // Reset form
      setAmount('');
      setSelectedCategory(null);
      setDescription('');
      setIsSubmitting(false);
      onClose();
    }, 500);
  };

  const handleAmountChange = (value: string) => {
    // Only allow numbers and one decimal point
    const regex = /^\d*\.?\d{0,2}$/;
    if (regex.test(value) || value === '') {
      setAmount(value);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay asChild>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
        </Dialog.Overlay>

        <Dialog.Content asChild>
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl glass border-t border-white/10 p-6 max-h-[90vh] overflow-y-auto"
          >
            {/* Handle bar */}
            <div className="flex justify-center mb-6">
              <div className="w-12 h-1.5 bg-white/20 rounded-full" />
            </div>

            {/* Title */}
            <Dialog.Title className="text-2xl font-bold mb-6 gradient-text">
              Add Expense
            </Dialog.Title>

            {/* Amount input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Amount
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-3xl font-bold text-gray-400">
                  $
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-purple-500/30 rounded-2xl text-3xl font-bold focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all placeholder:text-gray-600"
                  autoFocus
                />
              </div>
            </div>

            {/* Category selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-400 mb-3">
                Category
              </label>
              <div className="grid grid-cols-4 gap-3">
                {defaultCategories.map((category) => (
                  <motion.button
                    key={category.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedCategory(category)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all ${
                      selectedCategory?.id === category.id
                        ? 'bg-white/15 ring-2 ring-purple-500'
                        : 'bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <span className="text-3xl">{category.emoji}</span>
                    <span className="text-xs font-medium text-center">{category.name}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Description (optional)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What did you buy?"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all placeholder:text-gray-600"
              />
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-2xl font-semibold bg-white/5 hover:bg-white/10 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!amount || !selectedCategory || isSubmitting}
                className="flex-1 py-3 rounded-2xl font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/30"
              >
                {isSubmitting ? 'Adding...' : 'Add Expense'}
              </button>
            </div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
