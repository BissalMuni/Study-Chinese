import React from 'react';
import { motion } from 'framer-motion';
import { Header } from '../components/common';
import { useNavigate } from 'react-router-dom';
import { useGlobalState } from '../contexts/GlobalStateContext';
import {
  Trash2,
  RotateCcw,
  Info,
  Moon,
  Sun,
  Volume2,
  Type,
  Repeat,
  Minus,
  Plus,
} from 'lucide-react';

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, updateState, resetProgress } = useGlobalState();

  const repeatOptions = [1, 2, 3, 5, 10];

  const handleClearData = () => {
    if (window.confirm('모든 학습 데이터를 초기화하시겠습니까?')) {
      localStorage.clear();
      resetProgress();
      updateState('selectedType', null);
      updateState('selectedLessonId', null);
      updateState('dataCategory', null);
      window.location.reload();
    }
  };

  const toggleDarkMode = () => {
    updateState('isDarkMode', !state.isDarkMode);
  };

  const toggleAutoPlay = () => {
    updateState('isAutoPlay', !state.isAutoPlay);
  };

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <Header title="설정" onBack={() => navigate('/')} showThemeToggle={false} />

      <div className="p-4 space-y-4 max-w-md mx-auto">
        {/* 기본 설정 */}
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold text-gray-800 dark:text-white">기본 설정</h3>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {/* 다크 모드 */}
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${state.isDarkMode ? 'bg-indigo-100 dark:bg-indigo-900/30' : 'bg-amber-100 dark:bg-amber-900/30'}`}>
                  {state.isDarkMode ? (
                    <Moon size={20} className="text-indigo-600 dark:text-indigo-400" />
                  ) : (
                    <Sun size={20} className="text-amber-600 dark:text-amber-400" />
                  )}
                </div>
                <span className="text-gray-700 dark:text-gray-200">다크 모드</span>
              </div>
              <motion.button
                onClick={toggleDarkMode}
                className={`relative w-14 h-8 rounded-full transition-colors ${
                  state.isDarkMode ? 'bg-indigo-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="absolute top-1/2 -translate-y-1/2 left-1 w-6 h-6 bg-white rounded-full shadow-md"
                  animate={{ x: state.isDarkMode ? 24 : 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </motion.button>
            </div>

            {/* 자동 재생 */}
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${state.isAutoPlay ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-700'}`}>
                  <Volume2 size={20} className={state.isAutoPlay ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'} />
                </div>
                <span className="text-gray-700 dark:text-gray-200">자동 재생</span>
              </div>
              <motion.button
                onClick={toggleAutoPlay}
                className={`relative w-14 h-8 rounded-full transition-colors ${
                  state.isAutoPlay ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="absolute top-1/2 -translate-y-1/2 left-1 w-6 h-6 bg-white rounded-full shadow-md"
                  animate={{ x: state.isAutoPlay ? 24 : 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </motion.button>
            </div>

            {/* 글자 크기 */}
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <Type size={20} className="text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-gray-700 dark:text-gray-200">글자 크기</span>
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  onClick={decreaseFontSize}
                  disabled={state.fontSize <= 12}
                  className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg disabled:opacity-40"
                  whileTap={{ scale: 0.9 }}
                >
                  <Minus size={18} className="text-gray-600 dark:text-gray-300" />
                </motion.button>
                <span className="w-10 text-center font-bold text-gray-700 dark:text-gray-200">
                  {state.fontSize}
                </span>
                <motion.button
                  onClick={increaseFontSize}
                  disabled={state.fontSize >= 32}
                  className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg disabled:opacity-40"
                  whileTap={{ scale: 0.9 }}
                >
                  <Plus size={18} className="text-gray-600 dark:text-gray-300" />
                </motion.button>
              </div>
            </div>

            {/* 반복 횟수 */}
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                  <Repeat size={20} className="text-purple-600 dark:text-purple-400" />
                </div>
                <span className="text-gray-700 dark:text-gray-200">반복 횟수</span>
              </div>
              <div className="flex gap-1">
                {repeatOptions.map((count) => (
                  <motion.button
                    key={count}
                    onClick={() => updateState('repeatCount', count)}
                    className={`w-9 h-9 text-sm rounded-lg font-semibold transition-colors ${
                      state.repeatCount === count
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                    }`}
                    whileTap={{ scale: 0.95 }}
                  >
                    {count}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* 데이터 관리 */}
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold text-gray-800 dark:text-white">데이터 관리</h3>
          </div>

          <div className="p-3 space-y-2">
            <motion.button
              onClick={() => resetProgress()}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
              whileTap={{ scale: 0.98 }}
            >
              <RotateCcw size={20} className="text-amber-600 dark:text-amber-400" />
              <div className="text-left">
                <div className="font-medium text-amber-700 dark:text-amber-300">진행상황 초기화</div>
                <div className="text-xs text-amber-500 dark:text-amber-400/70">현재 레슨의 진행상황만 초기화</div>
              </div>
            </motion.button>

            <motion.button
              onClick={handleClearData}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
              whileTap={{ scale: 0.98 }}
            >
              <Trash2 size={20} className="text-red-600 dark:text-red-400" />
              <div className="text-left">
                <div className="font-medium text-red-700 dark:text-red-300">전체 초기화</div>
                <div className="text-xs text-red-500 dark:text-red-400/70">모든 학습 기록 삭제</div>
              </div>
            </motion.button>
          </div>
        </motion.div>

        {/* 앱 정보 */}
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
              <Info size={16} />
              앱 정보
            </h3>
          </div>

          <div className="px-4 py-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">버전</span>
              <span className="font-medium text-gray-700 dark:text-gray-200">0.2.0</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">빌드</span>
              <span className="font-medium text-gray-700 dark:text-gray-200">React + Tailwind</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">연속 학습</span>
              <span className="font-semibold text-purple-600 dark:text-purple-400">{state.streakCount}일</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SettingsPage;
