'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface FloatingActionButtonProps {
  onClick: () => void;
}

export function FloatingActionButton({ onClick }: FloatingActionButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.6, type: 'spring', stiffness: 200 }}
      whileTap={{ scale: 0.9 }}
      onTapStart={() => setIsPressed(true)}
      onTap={() => setIsPressed(false)}
      onTapCancel={() => setIsPressed(false)}
      onClick={onClick}
      className="fixed bottom-8 right-6 z-50 w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 shadow-2xl shadow-purple-500/50 flex items-center justify-center hover:shadow-purple-500/70 transition-shadow"
    >
      <motion.span
        animate={{ rotate: isPressed ? 45 : 0 }}
        transition={{ duration: 0.2 }}
        className="text-3xl text-white"
      >
        +
      </motion.span>
    </motion.button>
  );
}
