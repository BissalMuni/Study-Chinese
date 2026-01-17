import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Moon, Sun } from 'lucide-react';
import { useGlobalState } from '../../contexts/GlobalStateContext';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  showThemeToggle?: boolean;
  rightContent?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onBack,
  showThemeToggle = true,
  rightContent,
}) => {
  const { state, updateState } = useGlobalState();

  const toggleTheme = () => {
    updateState('isDarkMode', !state.isDarkMode);
  };

  return (
    <header className="shrink-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between h-14 px-4">
        {/* 왼쪽: 뒤로가기 */}
        <div className="w-20">
          {onBack && (
            <motion.button
              onClick={onBack}
              className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              whileTap={{ scale: 0.9 }}
            >
              <ArrowLeft size={24} className="text-gray-700 dark:text-gray-300" />
            </motion.button>
          )}
        </div>

        {/* 중앙: 타이틀 */}
        <div className="flex-1 text-center">
          <motion.h1
            className="text-lg font-bold text-gray-900 dark:text-white truncate"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            key={title}
          >
            {title}
          </motion.h1>
          {subtitle && (
            <motion.p
              className="text-xs text-gray-500 dark:text-gray-400 truncate"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {subtitle}
            </motion.p>
          )}
        </div>

        {/* 오른쪽: 테마 토글 또는 커스텀 콘텐츠 */}
        <div className="w-20 flex justify-end">
          {rightContent || (showThemeToggle && (
            <motion.button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              whileTap={{ scale: 0.9 }}
              animate={{ rotate: state.isDarkMode ? 360 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {state.isDarkMode ? (
                <Moon size={22} className="text-indigo-400" />
              ) : (
                <Sun size={22} className="text-amber-500" />
              )}
            </motion.button>
          ))}
        </div>
      </div>
    </header>
  );
};

export default Header;
