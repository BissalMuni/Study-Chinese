import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Square, SkipBack, SkipForward, Volume2, Menu } from 'lucide-react';
import { useGlobalState } from '../../contexts/GlobalStateContext';
import { ProgressBar } from '../common';

interface AudioControllerProps {
  isPlaying: boolean;
  currentRepeat: number;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onPrev: () => void;
  onNext: () => void;
  currentIndex: number;
  totalCount: number;
}

const AudioController: React.FC<AudioControllerProps> = ({
  isPlaying,
  currentRepeat,
  onPlay,
  onPause,
  onStop,
  onPrev,
  onNext,
  currentIndex,
  totalCount,
}) => {
  const { state, updateState } = useGlobalState();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const repeatOptions = [1, 2, 3, 5, 10];

  return (
    <motion.div
      className="fixed bottom-20 left-4 right-4 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-3 z-40"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
    >
      {/* 진행률 바 */}
      <div className="mb-2">
        <ProgressBar
          current={currentIndex + 1}
          total={totalCount}
          color={currentIndex === totalCount - 1 ? 'success' : 'primary'}
          size="sm"
          showLabel={false}
        />
      </div>

      {/* 토글 버튼 + 진행 상태 */}
      <div className="flex items-center justify-between mb-2">
        <motion.button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          whileTap={{ scale: 0.9 }}
        >
          <Menu size={20} className="text-gray-500 dark:text-gray-400" />
        </motion.button>

        <div className="flex items-center gap-2">
          {isPlaying && (
            <motion.div
              className="flex items-center gap-1 text-green-500"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <Volume2 size={16} />
              <span className="text-xs font-medium">
                {currentRepeat}/{state.repeatCount}회
              </span>
            </motion.div>
          )}
        </div>

        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {currentIndex + 1} / {totalCount}
        </span>
      </div>

      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {/* 컨트롤 버튼 */}
            <div className="flex items-center justify-center gap-4 mb-4">
              <motion.button
                onClick={onPrev}
                disabled={currentIndex <= 0}
                className="p-1 rounded-full bg-gray-100 dark:bg-gray-700 disabled:opacity-40"
                whileTap={{ scale: 0.9 }}
              >
                <SkipBack size={20} className="text-gray-600 dark:text-gray-300" />
              </motion.button>

              {isPlaying ? (
                <motion.button
                  onClick={onPause}
                  className="p-4 rounded-full bg-amber-500 text-white shadow-lg shadow-amber-500/30"
                  whileTap={{ scale: 0.9 }}
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                >
                  <Pause size={28} />
                </motion.button>
              ) : (
                <motion.button
                  onClick={onPlay}
                  className="p-4 rounded-full bg-primary-500 text-white shadow-lg shadow-primary-500/30"
                  whileTap={{ scale: 0.9 }}
                >
                  <Play size={28} className="ml-1" />
                </motion.button>
              )}

              <motion.button
                onClick={onStop}
                className="p-3 rounded-full bg-red-100 dark:bg-red-900/30"
                whileTap={{ scale: 0.9 }}
              >
                <Square size={20} className="text-red-500" />
              </motion.button>

              <motion.button
                onClick={onNext}
                disabled={currentIndex >= totalCount - 1}
                className="p-3 rounded-full bg-gray-100 dark:bg-gray-700 disabled:opacity-40"
                whileTap={{ scale: 0.9 }}
              >
                <SkipForward size={20} className="text-gray-600 dark:text-gray-300" />
              </motion.button>
            </div>

            {/* 반복 횟수 선택 */}
            <div className="flex items-center justify-center gap-2">
              {repeatOptions.map((count) => (
                <motion.button
                  key={count}
                  onClick={() => updateState('repeatCount', count)}
                  className={`px-3 py-1 text-sm rounded-full font-medium transition-all ${
                    state.repeatCount === count
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  {count}
                </motion.button>
              ))}
            </div>

            {/* 자동/수동 모드 */}
            <div className="flex justify-center mt-3">
              <motion.button
                onClick={() => updateState('isAutoPlay', !state.isAutoPlay)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  state.isAutoPlay
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
                whileTap={{ scale: 0.95 }}
              >
                {state.isAutoPlay ? '자동 모드' : '수동 모드'}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AudioController;
