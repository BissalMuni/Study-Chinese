import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Trophy, Star } from 'lucide-react';

interface StreakCounterProps {
  streak: number;
  showAnimation?: boolean;
}

const StreakCounter: React.FC<StreakCounterProps> = ({ streak, showAnimation = true }) => {
  const getStreakLevel = () => {
    if (streak >= 30) return { icon: <Trophy size={20} />, color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/30' };
    if (streak >= 10) return { icon: <Star size={20} />, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/30' };
    if (streak >= 5) return { icon: <Flame size={20} />, color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/30' };
    return { icon: <Flame size={20} />, color: 'text-gray-400', bg: 'bg-gray-100 dark:bg-gray-800' };
  };

  const level = getStreakLevel();

  return (
    <motion.div
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${level.bg}`}
      initial={showAnimation ? { scale: 0.8, opacity: 0 } : false}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={streak}
          className={level.color}
          initial={{ scale: 0, rotate: -180 }}
          animate={{
            scale: 1,
            rotate: 0,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
        >
          {level.icon}
        </motion.div>
      </AnimatePresence>

      <motion.span
        key={streak}
        className="font-bold text-gray-800 dark:text-white"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        {streak}
      </motion.span>

      <span className="text-sm text-gray-500 dark:text-gray-400">연속</span>

      {/* 불꽃 애니메이션 (streak >= 5) */}
      {streak >= 5 && (
        <motion.div
          className="absolute -top-1 -right-1"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{ repeat: Infinity, duration: 1 }}
        >
          <span className="text-lg">🔥</span>
        </motion.div>
      )}
    </motion.div>
  );
};

export default StreakCounter;
