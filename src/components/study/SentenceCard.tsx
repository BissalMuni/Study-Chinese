import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react';
import { Sentence } from '../../hooks/useLessonData';
import { useGlobalState } from '../../contexts/GlobalStateContext';
import { useSpeechSynthesis } from '../../hooks';

interface SentenceCardProps {
  sentence: Sentence;
  isActive?: boolean;
  onComplete?: () => void;
  showTranslations?: boolean;
}

const SentenceCard: React.FC<SentenceCardProps> = ({
  sentence,
  isActive = true,
  onComplete,
  showTranslations: initialShowTranslations = false,
}) => {
  const { state } = useGlobalState();
  const { speak, isPlaying, currentRepeat } = useSpeechSynthesis();
  const [showTranslations, setShowTranslations] = useState(initialShowTranslations);
  const [showWords, setShowWords] = useState(false);

  const handleSpeak = async (text: string, lang: string = 'chinese') => {
    await speak(text, lang, state.repeatCount);
    onComplete?.();
  };

  return (
    <motion.div
      className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden ${
        isActive ? 'ring-2 ring-primary-400 dark:ring-primary-500' : ''
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      layout
    >
      {/* 메인 문장 영역 */}
      <motion.div
        className="p-6 cursor-pointer"
        onClick={() => handleSpeak(sentence.sentence, 'chinese')}
        whileTap={{ scale: 0.98 }}
      >
        {/* 중국어 문장 */}
        <motion.p
          className="text-center font-bold text-gray-900 dark:text-white leading-relaxed"
          style={{ fontSize: state.fontSize + 4 }}
          animate={isPlaying ? { scale: [1, 1.02, 1] } : {}}
          transition={{ repeat: Infinity, duration: 1 }}
        >
          {sentence.sentence}
        </motion.p>

        {/* 병음 */}
        <motion.p
          className="text-center text-primary-600 dark:text-primary-400 mt-2"
          style={{ fontSize: state.fontSize - 2 }}
        >
          {sentence.pinyin}
        </motion.p>

        {/* 재생 상태 표시 */}
        <AnimatePresence>
          {isPlaying && (
            <motion.div
              className="flex items-center justify-center gap-2 mt-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Volume2 size={18} className="text-green-500 animate-pulse" />
              <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                {currentRepeat} / {state.repeatCount}회 재생 중
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* 번역 토글 버튼 */}
      <motion.button
        className="w-full py-3 px-6 bg-gray-50 dark:bg-gray-700/50 flex items-center justify-center gap-2 border-t border-gray-200 dark:border-gray-700"
        onClick={() => setShowTranslations(!showTranslations)}
        whileTap={{ scale: 0.98 }}
      >
        {showTranslations ? (
          <EyeOff size={16} className="text-gray-500" />
        ) : (
          <Eye size={16} className="text-gray-500" />
        )}
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {showTranslations ? '번역 숨기기' : '번역 보기'}
        </span>
      </motion.button>

      {/* 번역 영역 */}
      <AnimatePresence>
        {showTranslations && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-3 bg-gray-50 dark:bg-gray-700/30">
              {/* 한국어 */}
              <motion.div
                className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl cursor-pointer"
                onClick={() => handleSpeak(sentence.korean, 'korean')}
                whileTap={{ scale: 0.98 }}
                whileHover={{ x: 5 }}
              >
                <span className="text-lg">🇰🇷</span>
                <span style={{ fontSize: state.fontSize - 2 }} className="text-gray-800 dark:text-gray-200">
                  {sentence.korean}
                </span>
                <Volume2 size={16} className="ml-auto text-gray-400" />
              </motion.div>

              {/* 영어 */}
              {sentence.english && (
                <motion.div
                  className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl cursor-pointer"
                  onClick={() => handleSpeak(sentence.english!, 'english')}
                  whileTap={{ scale: 0.98 }}
                  whileHover={{ x: 5 }}
                >
                  <span className="text-lg">🇺🇸</span>
                  <span style={{ fontSize: state.fontSize - 2 }} className="text-gray-800 dark:text-gray-200">
                    {sentence.english}
                  </span>
                  <Volume2 size={16} className="ml-auto text-gray-400" />
                </motion.div>
              )}

              {/* 일본어 */}
              {sentence.japanese && (
                <motion.div
                  className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl cursor-pointer"
                  onClick={() => handleSpeak(sentence.japanese!, 'japanese')}
                  whileTap={{ scale: 0.98 }}
                  whileHover={{ x: 5 }}
                >
                  <span className="text-lg">🇯🇵</span>
                  <div className="flex-1">
                    <span style={{ fontSize: state.fontSize - 2 }} className="text-gray-800 dark:text-gray-200 block">
                      {sentence.japanese}
                    </span>
                    {sentence.japanese_romaji && (
                      <span className="text-xs text-gray-500">
                        {sentence.japanese_romaji}
                      </span>
                    )}
                  </div>
                  <Volume2 size={16} className="ml-auto text-gray-400" />
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 단어 정보 */}
      {sentence.words && sentence.words.words && sentence.words.words.length > 0 && (
        <>
          <motion.button
            className="w-full py-3 px-6 bg-gray-100 dark:bg-gray-700 flex items-center justify-center gap-2 border-t border-gray-200 dark:border-gray-600"
            onClick={() => setShowWords(!showWords)}
            whileTap={{ scale: 0.98 }}
          >
            {showWords ? (
              <ChevronUp size={16} className="text-gray-500" />
            ) : (
              <ChevronDown size={16} className="text-gray-500" />
            )}
            <span className="text-sm text-gray-600 dark:text-gray-400">
              단어 분석 ({sentence.words.words.length}개)
            </span>
          </motion.button>

          <AnimatePresence>
            {showWords && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="p-4 space-y-2 bg-gradient-to-b from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-800">
                  {sentence.words.words.map((word, idx) => (
                    <motion.div
                      key={idx}
                      className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm cursor-pointer"
                      onClick={() => handleSpeak(word, 'chinese')}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={{ scale: 1.02, x: 5 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-baseline gap-2">
                            <span className="text-lg font-bold text-gray-900 dark:text-white">
                              {word}
                            </span>
                            {sentence.words?.traditional?.[idx] && word !== sentence.words?.traditional[idx] && (
                              <span className="text-sm text-gray-500">
                                ({sentence.words?.traditional[idx]})
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-primary-600 dark:text-primary-400">
                            {sentence.words?.pinyin?.[idx]}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {sentence.words?.korean?.[idx]}
                          </div>
                          {sentence.words?.meaning_and_reading?.[idx] && (
                            <div className="text-xs text-gray-500 mt-1">
                              {sentence.words?.meaning_and_reading[idx]}
                            </div>
                          )}
                        </div>
                        <Volume2 size={16} className="text-gray-400" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </motion.div>
  );
};

export default SentenceCard;
