import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGlobalState } from '../../contexts/GlobalStateContext';
import { useLessonData, useSpeechSynthesis } from '../../hooks';
import { Header } from '../common';
import SentenceCard from './SentenceCard';
import MovingCardWrapper from './MovingCardWrapper';

// 랜덤 배경색 배열 (실제 색상 값으로 변경 - 그라데이션 애니메이션용)
const cardColorValues = [
  { from: '#3b82f6', to: '#4f46e5' }, // blue to indigo
  { from: '#a855f7', to: '#ec4899' }, // purple to pink
  { from: '#22c55e', to: '#14b8a6' }, // green to teal
  { from: '#f97316', to: '#ef4444' }, // orange to red
  { from: '#06b6d4', to: '#3b82f6' }, // cyan to blue
  { from: '#ec4899', to: '#f43f5e' }, // pink to rose
  { from: '#f59e0b', to: '#f97316' }, // amber to orange
  { from: '#6366f1', to: '#a855f7' }, // indigo to purple
];

const LessonStudyView: React.FC = () => {
  const { state, updateState } = useGlobalState();
  const { allSentences, selectedLessonContent } = useLessonData({
    selectedType: state.selectedType,
    selectedLessonId: state.selectedLessonId
  });
  const repeatPauseMs = (state.lessonPlaySettings.repeatPauseTime ?? 2) * 1000;
  const { speak, stop, isPlaying } = useSpeechSynthesis({ pauseBetweenRepeats: repeatPauseMs });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentRepeat, setCurrentRepeat] = useState(1);
  const [shuffledIndices, setShuffledIndices] = useState<number[]>([]);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [cardColors, setCardColors] = useState<{ from: string; to: string }>({ from: '#3b82f6', to: '#4f46e5' });
  const [showTranslations, setShowTranslations] = useState(false);
  const [showWords, setShowWords] = useState(false);
  const isStoppedRef = useRef(false);

  const settings = state.lessonPlaySettings;
  const actualIndex = settings.repeatOrder === 'random' && shuffledIndices.length > 0
    ? shuffledIndices[currentIndex]
    : currentIndex;
  const currentSentence = allSentences[actualIndex];

  // 랜덤 색상 선택
  const getRandomColor = useCallback(() => {
    return cardColorValues[Math.floor(Math.random() * cardColorValues.length)];
  }, []);

  // 초기 색상 설정
  useEffect(() => {
    if (settings.cardColorMode === 'random') {
      setCardColors(getRandomColor());
    }
  }, [settings.cardColorMode, getRandomColor]);

  // 랜덤 순서 생성
  useEffect(() => {
    if (allSentences.length > 0) {
      const indices = Array.from({ length: allSentences.length }, (_, i) => i);
      if (settings.repeatOrder === 'random') {
        for (let i = indices.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [indices[i], indices[j]] = [indices[j], indices[i]];
        }
      }
      setShuffledIndices(indices);
    }
  }, [allSentences.length, settings.repeatOrder]);

  // 다음 문장으로 이동
  const moveToNext = useCallback(() => {
    if (currentRepeat < settings.sentenceRepeatCount) {
      setCurrentRepeat(prev => prev + 1);
    } else {
      setCurrentRepeat(1);
      // 문장이 바뀔 때 색상 랜덤 변경
      if (settings.cardColorMode === 'random') {
        setCardColors(getRandomColor());
      }
      setCurrentIndex(prev => {
        if (prev >= allSentences.length - 1) {
          // 마지막 문장이면 처음으로
          if (settings.repeatOrder === 'random') {
            // 랜덤 순서 다시 섞기
            const indices = Array.from({ length: allSentences.length }, (_, i) => i);
            for (let i = indices.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [indices[i], indices[j]] = [indices[j], indices[i]];
            }
            setShuffledIndices(indices);
          }
          return 0;
        }
        return prev + 1;
      });
    }
  }, [currentRepeat, settings.sentenceRepeatCount, settings.repeatOrder, settings.cardColorMode, allSentences.length, getRandomColor]);

  // moveToNext를 ref로 저장하여 최신 버전 유지
  const moveToNextRef = useRef(moveToNext);
  useEffect(() => {
    moveToNextRef.current = moveToNext;
  }, [moveToNext]);

  // 자동 재생 루프
  useEffect(() => {
    if (!currentSentence || !isAutoPlaying || isStoppedRef.current) return;

    let isCancelled = false;

    const playAndMove = async () => {
      if (isCancelled || isStoppedRef.current) return;

      try {
        await speak(currentSentence.sentence, 'chinese', 1);
        if (!isCancelled && !isStoppedRef.current) {
          moveToNextRef.current();
        }
      } catch (error) {
        console.error('Speech error:', error);
      }
    };

    // transitionDelay 설정 적용 (초 -> 밀리초)
    const delayMs = (settings.transitionDelay || 1) * 1000;
    const timer = setTimeout(playAndMove, delayMs);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [currentSentence, currentIndex, currentRepeat, isAutoPlaying, speak, settings.transitionDelay]);

  // 컴포넌트 언마운트 시 정지
  useEffect(() => {
    isStoppedRef.current = false;
    return () => {
      isStoppedRef.current = true;
      stop();
    };
  }, [stop]);

  // 뒤로가기
  const handleBack = () => {
    isStoppedRef.current = true;
    setIsAutoPlaying(false);
    stop();
    updateState('playMode', 'lesson'); // 설정 화면으로
  };

  // 레슨 제목
  const lessonTitle = selectedLessonContent?.[0]?.content?.[0]?.category || '레슨 연습';

  // 애니메이션 variants 정의
  const animationVariants = {
    slide: {
      initial: { x: 100, opacity: 0 },
      animate: { x: 0, opacity: 1 },
      exit: { x: -100, opacity: 0 },
    },
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },
    flip: {
      initial: { rotateY: 90, opacity: 0 },
      animate: { rotateY: 0, opacity: 1 },
      exit: { rotateY: -90, opacity: 0 },
    },
    scale: {
      initial: { scale: 0.5, opacity: 0 },
      animate: { scale: 1, opacity: 1 },
      exit: { scale: 0.5, opacity: 0 },
    },
    zoom: {
      initial: { scale: 1.5, opacity: 0 },
      animate: { scale: 1, opacity: 1 },
      exit: { scale: 0.8, opacity: 0 },
    },
    rotate: {
      initial: { rotate: -180, opacity: 0 },
      animate: { rotate: 0, opacity: 1 },
      exit: { rotate: 180, opacity: 0 },
    },
    bounce: {
      initial: { y: -100, opacity: 0 },
      animate: { y: 0, opacity: 1, transition: { type: 'spring', bounce: 0.5 } },
      exit: { y: 100, opacity: 0 },
    },
    slideUp: {
      initial: { y: 100, opacity: 0 },
      animate: { y: 0, opacity: 1 },
      exit: { y: -100, opacity: 0 },
    },
    slideDown: {
      initial: { y: -100, opacity: 0 },
      animate: { y: 0, opacity: 1 },
      exit: { y: 100, opacity: 0 },
    },
    blur: {
      initial: { opacity: 0, filter: 'blur(20px)' },
      animate: { opacity: 1, filter: 'blur(0px)' },
      exit: { opacity: 0, filter: 'blur(20px)' },
    },
    elastic: {
      initial: { scale: 0, opacity: 0 },
      animate: { scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 10 } },
      exit: { scale: 0, opacity: 0 },
    },
    none: {
      initial: {},
      animate: {},
      exit: {},
    },
  };

  // 애니메이션 variants 가져오기
  const getAnimationVariants = () => {
    if (settings.cardAnimation === 'random') {
      const animationTypes = ['slide', 'fade', 'flip', 'scale', 'zoom', 'rotate', 'bounce', 'slideUp', 'slideDown', 'blur', 'elastic'] as const;
      const randomType = animationTypes[Math.floor(Math.random() * animationTypes.length)];
      return animationVariants[randomType];
    }
    return animationVariants[settings.cardAnimation] || animationVariants.slide;
  };

  if (!currentSentence) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-500 dark:text-gray-400">문장을 불러오는 중...</p>
      </div>
    );
  }

  const variants = getAnimationVariants();

  return (
    <div className="h-full flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Header
        title={lessonTitle}
        onBack={handleBack}
      />

      {/* 진행 상태 표시 */}
      <div className="px-4 py-2 flex items-center justify-between bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {currentIndex + 1} / {allSentences.length}
        </span>
        <motion.span
          className="text-sm font-medium text-primary-600 dark:text-primary-400"
          key={currentRepeat}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
        >
          반복: {currentRepeat} / {settings.sentenceRepeatCount}
        </motion.span>
      </div>

      {/* 문장 카드 - SentenceCard 사용 */}
      <div className="flex-1 p-4 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentIndex}`}
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <MovingCardWrapper isMoving={settings.cardMovement === 'moving'}>
              <SentenceCard
                sentence={currentSentence}
                isActive={true}
                showTranslations={showTranslations}
                onShowTranslationsChange={setShowTranslations}
                showWords={showWords}
                onShowWordsChange={setShowWords}
                cardGradient={settings.cardColorMode === 'random' ? cardColors : undefined}
              />
            </MovingCardWrapper>
          </motion.div>
        </AnimatePresence>
      </div>


    </div>
  );
};

export default LessonStudyView;
