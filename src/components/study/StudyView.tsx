import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGlobalState } from '../../contexts/GlobalStateContext';
import { useLessonData, useSpeechSynthesis, useSwipeNavigation } from '../../hooks';
import { Header, ProgressBar } from '../common';
import SentenceCard from './SentenceCard';
import AudioController from './AudioController';
import CelebrationEffect from '../animations/CelebrationEffect';

const StudyView: React.FC = () => {
  const { state, updateState, incrementStreak } = useGlobalState();
  const { allSentences, selectedLessonContent } = useLessonData({
    selectedType: state.selectedType,
    selectedLessonId: state.selectedLessonId
  });
  const { speak, stop, isPlaying, currentRepeat } = useSpeechSynthesis();
  const [showCelebration, setShowCelebration] = useState(false);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');

  const currentSentence = allSentences[state.currentSentenceIndex];

  // 스와이프 핸들러
  const swipeHandlers = useSwipeNavigation({
    onSwipeUp: () => handleNavigate('next'),
    onSwipeDown: () => handleNavigate('prev'),
  });

  // 문장 네비게이션
  const handleNavigate = useCallback((dir: 'next' | 'prev') => {
    setDirection(dir);

    if (dir === 'next') {
      if (state.currentSentenceIndex < allSentences.length - 1) {
        updateState('currentSentenceIndex', state.currentSentenceIndex + 1);
      } else {
        // 마지막 문장 완료 - 축하 효과
        setShowCelebration(true);
        incrementStreak();
        setTimeout(() => setShowCelebration(false), 2000);
      }
    } else {
      if (state.currentSentenceIndex > 0) {
        updateState('currentSentenceIndex', state.currentSentenceIndex - 1);
      }
    }
  }, [state.currentSentenceIndex, allSentences.length, updateState, incrementStreak]);

  // 자동 재생 모드
  useEffect(() => {
    if (!state.isAutoPlay || !currentSentence || isPlaying) return;

    const playCurrentSentence = async () => {
      await speak(currentSentence.sentence, 'chinese', state.repeatCount);

      // 다음 문장으로 자동 이동
      if (state.currentSentenceIndex < allSentences.length - 1) {
        handleNavigate('next');
      }
    };

    const timer = setTimeout(playCurrentSentence, 500);
    return () => clearTimeout(timer);
  }, [state.isAutoPlay, state.currentSentenceIndex, currentSentence]);

  // 오디오 컨트롤
  const handlePlay = () => {
    if (currentSentence) {
      speak(currentSentence.sentence, 'chinese', state.repeatCount);
    }
  };

  const handlePause = () => {
    stop();
  };

  const handleStop = () => {
    stop();
    updateState('isAutoPlay', false);
  };

  // 레슨 제목
  const lessonTitle = selectedLessonContent?.[0]?.content?.[0]?.category || '학습';

  if (!currentSentence) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 dark:text-gray-400">문장을 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-40">
      <Header
        title={lessonTitle}
        subtitle={`${state.currentSentenceIndex + 1} / ${allSentences.length}`}
        onBack={() => updateState('selectedLessonId', null)}
      />

      {/* 진행률 바 */}
      <div className="px-4 py-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <ProgressBar
          current={state.currentSentenceIndex + 1}
          total={allSentences.length}
          color={state.currentSentenceIndex === allSentences.length - 1 ? 'success' : 'primary'}
        />
      </div>

      {/* 문장 카드 */}
      <div
        className="p-4"
        {...swipeHandlers}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={state.currentSentenceIndex}
            initial={{
              opacity: 0,
              x: direction === 'next' ? 100 : -100
            }}
            animate={{ opacity: 1, x: 0 }}
            exit={{
              opacity: 0,
              x: direction === 'next' ? -100 : 100
            }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <SentenceCard
              sentence={currentSentence}
              isActive={true}
              onComplete={() => {
                if (state.isAutoPlay && state.currentSentenceIndex < allSentences.length - 1) {
                  handleNavigate('next');
                }
              }}
            />
          </motion.div>
        </AnimatePresence>

        {/* 스와이프 힌트 */}
        <motion.div
          className="flex justify-center mt-6 text-sm text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <span>↑ 위로 스와이프: 다음 | ↓ 아래로 스와이프: 이전</span>
        </motion.div>
      </div>

      {/* 오디오 컨트롤러 */}
      <AudioController
        isPlaying={isPlaying}
        currentRepeat={currentRepeat}
        onPlay={handlePlay}
        onPause={handlePause}
        onStop={handleStop}
        onPrev={() => handleNavigate('prev')}
        onNext={() => handleNavigate('next')}
        currentIndex={state.currentSentenceIndex}
        totalCount={allSentences.length}
      />

      {/* 축하 효과 */}
      <CelebrationEffect show={showCelebration} />
    </div>
  );
};

export default StudyView;
