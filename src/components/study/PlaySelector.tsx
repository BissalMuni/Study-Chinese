import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Repeat, ChevronRight, Play, Settings, ArrowLeft } from 'lucide-react';
import { PlayMode } from '../../contexts/GlobalStateContext';

interface PlaySelectorProps {
  onSelectMode: (mode: PlayMode) => void;
  onStartLessonDirect?: () => void; // 바로 시작 (설정 화면 없이)
}

const PlaySelector: React.FC<PlaySelectorProps> = ({ onSelectMode, onStartLessonDirect }) => {
  const [showLessonOptions, setShowLessonOptions] = useState(false);

  const playModes = [
    {
      mode: 'sentence' as PlayMode,
      icon: <BookOpen size={28} />,
      title: '한 문장씩 학습',
      gradient: 'from-blue-500 to-indigo-600',
    },
    {
      mode: 'lesson' as PlayMode,
      icon: <Repeat size={28} />,
      title: '레슨 반복 학습',
      gradient: 'from-purple-500 to-pink-600',
    },
  ];

  const handleModeClick = (mode: PlayMode) => {
    if (mode === 'lesson') {
      setShowLessonOptions(true);
    } else {
      onSelectMode(mode);
    }
  };

  const handleStartDirect = () => {
    if (onStartLessonDirect) {
      onStartLessonDirect();
    }
  };

  const handleStartWithSettings = () => {
    onSelectMode('lesson');
  };

  return (
    <div className="p-4 space-y-4">
      <AnimatePresence mode="wait">
        {!showLessonOptions ? (
          <motion.div
            key="main-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-4"
          >
            <motion.p
              className="text-center text-gray-600 dark:text-gray-400 mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              학습 방식을 선택하세요
            </motion.p>

            {playModes.map((item, index) => (
              <motion.button
                key={item.mode}
                onClick={() => handleModeClick(item.mode)}
                className={`w-full p-4 rounded-2xl bg-gradient-to-r ${item.gradient} shadow-lg text-left`}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm text-white">
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white">{item.title}</h3>
                  </div>
                  <ChevronRight size={24} className="text-white/50" />
                </div>
              </motion.button>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="lesson-options"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* 뒤로가기 버튼 */}
            <motion.button
              onClick={() => setShowLessonOptions(false)}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2"
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft size={20} />
              <span>뒤로</span>
            </motion.button>

            <motion.p
              className="text-center text-gray-600 dark:text-gray-400 mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              레슨 반복 학습
            </motion.p>

            {/* 바로 시작 */}
            <motion.button
              onClick={handleStartDirect}
              className="w-full p-4 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg text-left"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm text-white">
                  <Play size={28} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white">바로 시작</h3>
                  <p className="text-sm text-white/70">저장된 설정으로 학습 시작</p>
                </div>
                <ChevronRight size={24} className="text-white/50" />
              </div>
            </motion.button>

            {/* 설정 후 시작 */}
            <motion.button
              onClick={handleStartWithSettings}
              className="w-full p-4 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-600 shadow-lg text-left"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm text-white">
                  <Settings size={28} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white">설정 후 시작</h3>
                  <p className="text-sm text-white/70">설정 변경 후 학습 시작</p>
                </div>
                <ChevronRight size={24} className="text-white/50" />
              </div>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PlaySelector;
