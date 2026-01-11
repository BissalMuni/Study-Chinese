import React from 'react';
import { motion } from 'framer-motion';
import { Header, SettingsBox } from '../components/common';
import { useNavigate } from 'react-router-dom';
import { useGlobalState } from '../contexts/GlobalStateContext';
import { Trash2, RotateCcw, Info } from 'lucide-react';

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, updateState, resetProgress } = useGlobalState();

  const handleClearData = () => {
    if (window.confirm('모든 학습 데이터를 초기화하시겠습니까?')) {
      localStorage.clear();
      resetProgress();
      updateState('selectedType', null);
      updateState('selectedLessonId', null);
      updateState('dataCategory', null);
      updateState('viewMode', null);
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <Header title="설정" onBack={() => navigate('/')} />

      <div className="p-4 space-y-4 max-w-md mx-auto">
        {/* 기본 설정 */}
        <SettingsBox />

        {/* 데이터 관리 */}
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-gray-800 dark:text-white">데이터 관리</h3>
          </div>

          <div className="p-4 space-y-3">
            <motion.button
              onClick={handleClearData}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
              whileTap={{ scale: 0.98 }}
            >
              <Trash2 size={20} />
              <div className="text-left">
                <div className="font-medium">데이터 초기화</div>
                <div className="text-xs text-red-400">모든 학습 기록을 삭제합니다</div>
              </div>
            </motion.button>

            <motion.button
              onClick={() => resetProgress()}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
              whileTap={{ scale: 0.98 }}
            >
              <RotateCcw size={20} />
              <div className="text-left">
                <div className="font-medium">진행상황 초기화</div>
                <div className="text-xs text-amber-400">현재 레슨의 진행상황만 초기화</div>
              </div>
            </motion.button>
          </div>
        </motion.div>

        {/* 앱 정보 */}
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <Info size={18} />
              앱 정보
            </h3>
          </div>

          <div className="p-4 space-y-2 text-sm">
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>버전</span>
              <span className="font-medium">0.2.0</span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>빌드</span>
              <span className="font-medium">React + Tailwind</span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>연속 학습</span>
              <span className="font-medium text-primary-500">{state.streakCount}일</span>
            </div>
          </div>
        </motion.div>

        {/* 현재 설정 상태 표시 */}
        <motion.div
          className="bg-gray-100 dark:bg-gray-800/50 rounded-xl p-4 text-xs text-gray-500 dark:text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="font-mono space-y-1">
            <p>다크모드: {state.isDarkMode ? 'ON' : 'OFF'}</p>
            <p>자동재생: {state.isAutoPlay ? 'ON' : 'OFF'}</p>
            <p>반복횟수: {state.repeatCount}회</p>
            <p>글자크기: {state.fontSize}px</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SettingsPage;
