import React from 'react';
import { motion } from 'framer-motion';
import { Shuffle, ArrowRight, Repeat, Palette, Play, Minus, Plus, Clock, Move, Lock } from 'lucide-react';
import { useGlobalState, LessonPlaySettings, RepeatOrder, CardAnimation, CardColorMode, CardMovement } from '../../contexts/GlobalStateContext';

interface LessonPlaySettingsSelectorProps {
  onStart: () => void;
}

const LessonPlaySettingsSelector: React.FC<LessonPlaySettingsSelectorProps> = ({ onStart }) => {
  const { state, updateState } = useGlobalState();
  const settings = state.lessonPlaySettings;

  const updateSettings = (key: keyof LessonPlaySettings, value: RepeatOrder | CardAnimation | CardColorMode | CardMovement | number) => {
    updateState('lessonPlaySettings', {
      ...settings,
      [key]: value,
    });
  };

  const repeatOrders: { value: RepeatOrder; label: string; icon: React.ReactNode }[] = [
    { value: 'sequential', label: '순차 반복', icon: <ArrowRight size={20} /> },
    { value: 'random', label: '랜덤 반복', icon: <Shuffle size={20} /> },
  ];

  const animations: { value: CardAnimation; label: string }[] = [
    { value: 'random', label: '랜덤' },
    { value: 'slide', label: '슬라이드' },
    { value: 'fade', label: '페이드' },
    { value: 'flip', label: '플립' },
    { value: 'scale', label: '스케일' },
    { value: 'zoom', label: '줌' },
    { value: 'rotate', label: '회전' },
    { value: 'bounce', label: '바운스' },
    { value: 'slideUp', label: '위로' },
    { value: 'slideDown', label: '아래로' },
    { value: 'blur', label: '블러' },
    { value: 'elastic', label: '탄성' },
    { value: 'none', label: '없음' },
  ];

  const colorModes: { value: CardColorMode; label: string; icon: React.ReactNode }[] = [
    { value: 'fixed', label: '고정 색상', icon: <Palette size={20} /> },
    { value: 'random', label: '랜덤 색상', icon: <Shuffle size={20} /> },
  ];

  const movementModes: { value: CardMovement; label: string; icon: React.ReactNode }[] = [
    { value: 'fixed', label: '고정', icon: <Lock size={20} /> },
    { value: 'moving', label: '이동', icon: <Move size={20} /> },
  ];

  return (
    <div className="p-2 space-y-3">
      {/* <motion.p
        className="text-center text-gray-600 dark:text-gray-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        레슨 연습 설정
      </motion.p> */}

      {/* 반복 순서 */}
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-2xl p-2 shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Repeat size={18} className="text-purple-500" />
          <span className="font-medium text-gray-700 dark:text-gray-200">반복 순서</span>
        </div>
        <div className="flex gap-2">
          {repeatOrders.map((order) => (
            <motion.button
              key={order.value}
              onClick={() => updateSettings('repeatOrder', order.value)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${
                settings.repeatOrder === order.value
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
              }`}
              whileTap={{ scale: 0.95 }}
            >
              {order.icon}
              <span>{order.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* 문장별 반복 횟수 */}
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Repeat size={18} className="text-blue-500" />
            <span className="font-medium text-gray-700 dark:text-gray-200">문장 반복 횟수</span>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              onClick={() => updateSettings('sentenceRepeatCount', Math.max(1, settings.sentenceRepeatCount - 1))}
              disabled={settings.sentenceRepeatCount <= 1}
              className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg disabled:opacity-40"
              whileTap={{ scale: 0.9 }}
            >
              <Minus size={18} className="text-gray-600 dark:text-gray-300" />
            </motion.button>
            <span className="w-10 text-center font-bold text-xl text-gray-700 dark:text-gray-200">
              {settings.sentenceRepeatCount}
            </span>
            <motion.button
              onClick={() => updateSettings('sentenceRepeatCount', Math.min(10, settings.sentenceRepeatCount + 1))}
              disabled={settings.sentenceRepeatCount >= 10}
              className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg disabled:opacity-40"
              whileTap={{ scale: 0.9 }}
            >
              <Plus size={18} className="text-gray-600 dark:text-gray-300" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* 반복 대기 시간 */}
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-orange-500" />
            <span className="font-medium text-gray-700 dark:text-gray-200">반복 대기 시간</span>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              onClick={() => updateSettings('repeatPauseTime', Math.max(0, (settings.repeatPauseTime ?? 2) - 0.5))}
              disabled={(settings.repeatPauseTime ?? 2) <= 0}
              className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg disabled:opacity-40"
              whileTap={{ scale: 0.9 }}
            >
              <Minus size={18} className="text-gray-600 dark:text-gray-300" />
            </motion.button>
            <span className="w-14 text-center font-bold text-xl text-gray-700 dark:text-gray-200">
              {settings.repeatPauseTime ?? 2}초
            </span>
            <motion.button
              onClick={() => updateSettings('repeatPauseTime', Math.min(5, (settings.repeatPauseTime ?? 2) + 0.5))}
              disabled={(settings.repeatPauseTime ?? 2) >= 5}
              className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg disabled:opacity-40"
              whileTap={{ scale: 0.9 }}
            >
              <Plus size={18} className="text-gray-600 dark:text-gray-300" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* 카드 전환 애니메이션 */}
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Play size={18} className="text-green-500" />
          <span className="font-medium text-gray-700 dark:text-gray-200">카드 전환 효과</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {animations.map((anim) => (
            <motion.button
              key={anim.value}
              onClick={() => updateSettings('cardAnimation', anim.value)}
              className={`py-2 px-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                settings.cardAnimation === anim.value
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
              }`}
              whileTap={{ scale: 0.95 }}
            >
              {anim.label}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* 카드 배경 색상 */}
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Palette size={18} className="text-pink-500" />
          <span className="font-medium text-gray-700 dark:text-gray-200">카드 배경 색상</span>
        </div>
        <div className="flex gap-2">
          {colorModes.map((mode) => (
            <motion.button
              key={mode.value}
              onClick={() => updateSettings('cardColorMode', mode.value)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${
                settings.cardColorMode === mode.value
                  ? 'bg-pink-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
              }`}
              whileTap={{ scale: 0.95 }}
            >
              {mode.icon}
              <span>{mode.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* 카드 전환 쉬는 시간 */}
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-amber-500" />
            <span className="font-medium text-gray-700 dark:text-gray-200">전환 대기 시간</span>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              onClick={() => updateSettings('transitionDelay', Math.max(0, (settings.transitionDelay || 1) - 1))}
              disabled={(settings.transitionDelay || 1) <= 0}
              className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg disabled:opacity-40"
              whileTap={{ scale: 0.9 }}
            >
              <Minus size={18} className="text-gray-600 dark:text-gray-300" />
            </motion.button>
            <span className="w-14 text-center font-bold text-xl text-gray-700 dark:text-gray-200">
              {settings.transitionDelay || 1}초
            </span>
            <motion.button
              onClick={() => updateSettings('transitionDelay', Math.min(5, (settings.transitionDelay || 1) + 1))}
              disabled={(settings.transitionDelay || 1) >= 5}
              className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg disabled:opacity-40"
              whileTap={{ scale: 0.9 }}
            >
              <Plus size={18} className="text-gray-600 dark:text-gray-300" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* 카드 이동 설정 */}
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Move size={18} className="text-cyan-500" />
          <span className="font-medium text-gray-700 dark:text-gray-200">카드 이동</span>
        </div>
        <div className="flex gap-2">
          {movementModes.map((mode) => (
            <motion.button
              key={mode.value}
              onClick={() => updateSettings('cardMovement', mode.value)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${
                settings.cardMovement === mode.value
                  ? 'bg-cyan-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
              }`}
              whileTap={{ scale: 0.95 }}
            >
              {mode.icon}
              <span>{mode.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* 시작 버튼 */}
      <motion.button
        onClick={onStart}
        className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold text-lg rounded-2xl shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center justify-center gap-2">
          <Play size={24} />
          <span>연습 시작</span>
        </div>
      </motion.button>
    </div>
  );
};

export default LessonPlaySettingsSelector;
