import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  current: number;
  total: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'success' | 'warning';
  animated?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  total,
  showLabel = true,
  size = 'md',
  color = 'primary',
  animated = true,
}) => {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const colorClasses = {
    primary: 'from-primary-400 to-primary-600',
    success: 'from-green-400 to-green-600',
    warning: 'from-amber-400 to-amber-600',
  };

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
            진행률
          </span>
          <motion.span
            className="text-xs font-bold text-gray-700 dark:text-gray-300"
            key={percentage}
            initial={{ scale: 1.2, color: '#3b82f6' }}
            animate={{ scale: 1, color: 'inherit' }}
            transition={{ duration: 0.3 }}
          >
            {current} / {total} ({percentage}%)
          </motion.span>
        </div>
      )}

      <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <motion.div
          className={`h-full bg-gradient-to-r ${colorClasses[color]} rounded-full relative`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{
            duration: animated ? 0.5 : 0,
            ease: 'easeOut'
          }}
        >
          {/* 반짝이는 효과 */}
          {animated && percentage > 0 && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{
                x: ['-100%', '200%'],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatDelay: 2,
              }}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ProgressBar;
