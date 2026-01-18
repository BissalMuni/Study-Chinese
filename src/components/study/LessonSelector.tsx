import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Check } from 'lucide-react';

interface LessonInfo {
  lesson: number | string;
  id: number | string;
  category: string;
}

interface LessonSelectorProps {
  lessons: LessonInfo[];
  selectedLessonId: string | null;
  onSelectLesson: (lessonId: string) => void;
  loading?: boolean;
}

const LessonSelector: React.FC<LessonSelectorProps> = ({
  lessons,
  selectedLessonId,
  onSelectLesson,
  loading = false,
}) => {
  const lessonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  // 선택된 레슨으로 자동 스크롤
  useEffect(() => {
    if (selectedLessonId && lessonRefs.current[selectedLessonId]) {
      setTimeout(() => {
        lessonRefs.current[selectedLessonId]?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 100);
    }
  }, [selectedLessonId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <motion.div
          className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        />
      </div>
    );
  }

  return (
    <div className="p-3 space-y-3">
      <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
        <BookOpen size={20} className="text-primary-500" />
        레슨 선택
      </h2>

      <div className="grid gap-3">
        {lessons.map((lesson, index) => {
          const isSelected = String(lesson.lesson) === String(selectedLessonId);

          return (
            <motion.button
              key={`${lesson.lesson}-${index}`}
              ref={(el) => {
                lessonRefs.current[String(lesson.lesson)] = el;
              }}
              onClick={() => onSelectLesson(String(lesson.lesson))}
              className={`relative p-2 rounded-xl text-left transition-all ${
                isSelected
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                  : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              whileHover={{ scale: 1.02, x: 5 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-bold text-lg">
                    제{lesson.lesson}과
                  </div>
                  {lesson.category && (
                    <div className={`text-sm mt-1 ${
                      isSelected ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {lesson.category}
                    </div>
                  )}
                </div>

                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"
                  >
                    <Check size={18} />
                  </motion.div>
                )}
              </div>

              {/* 선택 효과 */}
              {isSelected && (
                <motion.div
                  className="absolute inset-0 rounded-xl border-2 border-white/30"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  layoutId="selectedLesson"
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default LessonSelector;
