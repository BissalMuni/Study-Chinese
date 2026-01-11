import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CelebrationEffectProps {
  show: boolean;
}

const CelebrationEffect: React.FC<CelebrationEffectProps> = ({ show }) => {
  // 파티클 생성
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 1 + Math.random() * 1,
    size: 8 + Math.random() * 16,
    color: [
      '#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3',
      '#54a0ff', '#5f27cd', '#00d2d3', '#1dd1a1'
    ][Math.floor(Math.random() * 8)],
  }));

  // 별 이모지들
  const stars = ['⭐', '🌟', '✨', '💫', '🎉', '🎊', '🏆', '👏'];

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* 배경 오버레이 */}
          <motion.div
            className="absolute inset-0 bg-black/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* 컨페티 파티클 */}
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute rounded-full"
              style={{
                left: `${particle.x}%`,
                top: '-20px',
                width: particle.size,
                height: particle.size,
                backgroundColor: particle.color,
              }}
              initial={{ y: -20, opacity: 1, rotate: 0 }}
              animate={{
                y: window.innerHeight + 50,
                opacity: [1, 1, 0],
                rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
                x: [0, (Math.random() - 0.5) * 100, (Math.random() - 0.5) * 150],
              }}
              transition={{
                duration: particle.duration,
                delay: particle.delay,
                ease: 'easeOut',
              }}
            />
          ))}

          {/* 중앙 축하 메시지 */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          >
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl text-center">
              <motion.div
                className="text-6xl mb-4"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0],
                }}
                transition={{ repeat: 2, duration: 0.5 }}
              >
                🎉
              </motion.div>
              <motion.h2
                className="text-2xl font-bold text-gray-800 dark:text-white mb-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                축하합니다!
              </motion.h2>
              <motion.p
                className="text-gray-600 dark:text-gray-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                레슨을 완료했습니다!
              </motion.p>
            </div>
          </motion.div>

          {/* 떨어지는 별들 */}
          {stars.map((star, i) => (
            <motion.div
              key={`star-${i}`}
              className="absolute text-3xl"
              style={{
                left: `${10 + i * 12}%`,
                top: '-50px',
              }}
              initial={{ y: -50, opacity: 1, scale: 0 }}
              animate={{
                y: window.innerHeight + 100,
                opacity: [0, 1, 1, 0],
                scale: [0, 1, 1, 0.5],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 2.5,
                delay: 0.3 + i * 0.15,
                ease: 'easeOut',
              }}
            >
              {star}
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CelebrationEffect;
