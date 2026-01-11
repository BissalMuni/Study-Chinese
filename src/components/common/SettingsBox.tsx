import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  Minus,
  Plus,
  Type,
  Moon,
  Sun,
  Volume2,
  Repeat,
  ChevronDown
} from 'lucide-react';
import { useGlobalState } from '../../contexts/GlobalStateContext';

const SettingsBox: React.FC = () => {
  const { state, updateState } = useGlobalState();
  const [isOpen, setIsOpen] = useState(false);

  const repeatOptions = [1, 2, 3, 5, 10];

  const increaseFontSize = () => {
    if (state.fontSize < 32) {
      updateState('fontSize', state.fontSize + 2);
    }
  };

  const decreaseFontSize = () => {
    if (state.fontSize > 12) {
      updateState('fontSize', state.fontSize - 2);
    }
  };

  const toggleDarkMode = () => {
    updateState('isDarkMode', !state.isDarkMode);
  };

  const toggleAutoPlay = () => {
    updateState('isAutoPlay', !state.isAutoPlay);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      {/* 헤더 - 토글 버튼 */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center gap-2">
          <Settings size={18} className="text-gray-600 dark:text-gray-300" />
          <span className="font-medium text-gray-800 dark:text-gray-200">설정</span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={18} className="text-gray-500" />
        </motion.div>
      </motion.button>

      {/* 설정 내용 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-4">
              {/* 다크 모드 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {state.isDarkMode ? (
                    <Moon size={18} className="text-indigo-500" />
                  ) : (
                    <Sun size={18} className="text-amber-500" />
                  )}
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    다크 모드
                  </span>
                </div>
                <motion.button
                  onClick={toggleDarkMode}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    state.isDarkMode ? 'bg-indigo-500' : 'bg-gray-300'
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow"
                    animate={{ x: state.isDarkMode ? 24 : 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </motion.button>
              </div>

              {/* 자동 재생 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Volume2 size={18} className="text-green-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    자동 재생
                  </span>
                </div>
                <motion.button
                  onClick={toggleAutoPlay}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    state.isAutoPlay ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow"
                    animate={{ x: state.isAutoPlay ? 24 : 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </motion.button>
              </div>

              {/* 글자 크기 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Type size={18} className="text-blue-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    글자 크기
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <motion.button
                    onClick={decreaseFontSize}
                    disabled={state.fontSize <= 12}
                    className="p-1.5 bg-gray-100 dark:bg-gray-600 rounded-lg disabled:opacity-40"
                    whileTap={{ scale: 0.9 }}
                  >
                    <Minus size={16} className="text-gray-600 dark:text-gray-300" />
                  </motion.button>
                  <span className="w-8 text-center text-sm font-bold text-gray-700 dark:text-gray-300">
                    {state.fontSize}
                  </span>
                  <motion.button
                    onClick={increaseFontSize}
                    disabled={state.fontSize >= 32}
                    className="p-1.5 bg-gray-100 dark:bg-gray-600 rounded-lg disabled:opacity-40"
                    whileTap={{ scale: 0.9 }}
                  >
                    <Plus size={16} className="text-gray-600 dark:text-gray-300" />
                  </motion.button>
                </div>
              </div>

              {/* 반복 횟수 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Repeat size={18} className="text-purple-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    반복 횟수
                  </span>
                </div>
                <div className="flex gap-1">
                  {repeatOptions.map((count) => (
                    <motion.button
                      key={count}
                      onClick={() => updateState('repeatCount', count)}
                      className={`px-3 py-1 text-sm rounded-lg font-medium transition-colors ${
                        state.repeatCount === count
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                      }`}
                      whileTap={{ scale: 0.95 }}
                      animate={{
                        scale: state.repeatCount === count ? 1.05 : 1
                      }}
                    >
                      {count}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SettingsBox;
