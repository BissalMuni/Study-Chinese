import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Settings, Sparkles } from 'lucide-react';
import { useGlobalState } from '../contexts/GlobalStateContext';
import { StreakCounter } from '../components/animations';

const Home: React.FC = () => {
  const { state } = useGlobalState();

  const menuItems = [
    {
      to: '/study',
      icon: <BookOpen size={32} />,
      title: '학습하기',
      description: '체계적인 중국어 학습',
      gradient: 'from-blue-500 to-purple-600',
      delay: 0.1,
    },
    {
      to: '/settings',
      icon: <Settings size={32} />,
      title: '설정',
      description: '앱 환경 설정',
      gradient: 'from-gray-500 to-gray-700',
      delay: 0.2,
    },
  ];

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* 배경 장식 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-40 right-10 w-80 h-80 bg-white/10 rounded-full blur-3xl"
          animate={{
            x: [0, -30, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="relative z-10 flex-1 flex flex-col justify-center gap-8 px-6 py-8">
        {/* 헤더 */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-lg rounded-3xl mb-6"
            whileHover={{ rotate: 10, scale: 1.1 }}
          >
            <span className="text-5xl">中</span>
          </motion.div>

          <h1 className="text-4xl font-bold text-white mb-2">
            중국어 학습
          </h1>
          <p className="text-white/70">
            매일 조금씩, 꾸준히 학습하세요
          </p>

          {/* 연속 학습 카운터 */}
          {state.streakCount > 0 && (
            <motion.div
              className="mt-6 inline-block"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
            >
              <StreakCounter streak={state.streakCount} />
            </motion.div>
          )}
        </motion.div>

        {/* 메뉴 카드 */}
        <div className="flex flex-col gap-6 max-w-md mx-auto w-full">
          {menuItems.map((item, index) => (
            <motion.div
              key={item.to}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: item.delay, duration: 0.4 }}
            >
              <Link to={item.to}>
                <motion.div
                  className={`relative overflow-hidden p-2 rounded-2xl bg-gradient-to-r ${item.gradient} shadow-xl`}
                  whileHover={{ scale: 1.02, y: -3 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* 배경 효과 */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />

                  <div className="relative flex items-center gap-5">
                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm text-white">
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-white">
                        {item.title}
                      </h2>
                      <p className="text-sm text-white/70">
                        {item.description}
                      </p>
                    </div>
                    <motion.div
                      className="text-white/50"
                      animate={{ x: [0, 5, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                      →
                    </motion.div>
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* 하단 정보 */}
        <motion.div
          className="text-center text-white/50 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <div className="flex items-center justify-center gap-2">
            <Sparkles size={14} />
            <span>학습 효과를 높이는 반복 학습</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;
