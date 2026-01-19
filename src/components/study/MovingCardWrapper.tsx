import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

interface MovingCardWrapperProps {
  children: React.ReactNode;
  isMoving: boolean;
}

const MovingCardWrapper: React.FC<MovingCardWrapperProps> = ({ children, isMoving }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [velocity, setVelocity] = useState({ x: 0, y: 0, r: 0 });
  const [isPressing, setIsPressing] = useState(false);
  const animationRef = useRef<number | undefined>(undefined);

  // 새로운 랜덤 속도 생성
  const createNewVelocity = useCallback(() => ({
    x: (Math.random() - 0.5) * 1.5,
    y: (Math.random() - 0.5) * 3,
    r: (Math.random() - 0.5) * 0.5,
  }), []);

  // 현재 속도에서 약간 변형
  const tweakVelocity = useCallback((v: { x: number; y: number; r: number }) => ({
    x: v.x + (Math.random() - 0.5) * 0.5,
    y: v.y + (Math.random() - 0.5) * 0.5,
    r: v.r + (Math.random() - 0.5) * 0.2,
  }), []);

  // 초기 속도 설정
  useEffect(() => {
    if (isMoving) {
      setVelocity(createNewVelocity());
    } else {
      setPosition({ x: 0, y: 0 });
      setRotation(0);
    }
  }, [isMoving, createNewVelocity]);

  // 애니메이션 루프
  useEffect(() => {
    if (!isMoving || isPressing) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    const animate = () => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();
      const cardElement = container.firstElementChild as HTMLElement;
      if (!cardElement) return;

      const cardRect = cardElement.getBoundingClientRect();

      // 화면 1/5 범위 제한 계산
      const maxX = (containerRect.width - cardRect.width) / 2 + cardRect.width / 8;
      const maxY = (containerRect.height - cardRect.height) / 2 + cardRect.height / 8;

      setPosition((prev) => {
        let newX = prev.x + velocity.x;
        let newY = prev.y + velocity.y;

        // 경계 체크 및 방향 전환
        if (Math.abs(newX) > maxX) {
          setVelocity((v) => ({ ...v, x: -v.x * 0.9 }));
          newX = Math.sign(newX) * maxX;
        }
        if (Math.abs(newY) > maxY) {
          setVelocity((v) => ({ ...v, y: -v.y * 0.9 }));
          newY = Math.sign(newY) * maxY;
        }

        return { x: newX, y: newY };
      });

      setRotation((prev) => {
        let newR = prev + velocity.r;
        // 회전 범위 제한 (-15도 ~ 15도)
        if (Math.abs(newR) > 15) {
          setVelocity((v) => ({ ...v, r: -v.r * 0.9 }));
          newR = Math.sign(newR) * 15;
        }
        return newR;
      });

      // 가끔 랜덤하게 방향 변경
      if (Math.random() < 0.005) {
        setVelocity((v) => tweakVelocity(v));
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isMoving, isPressing, velocity, tweakVelocity]);

  // 터치/클릭 시작
  const handlePressStart = () => {
    if (!isMoving) return;
    setIsPressing(true);
  };

  // 터치/클릭 종료
  const handlePressEnd = () => {
    if (!isMoving) return;
    setIsPressing(false);
    // 새로운 랜덤 방향으로 재시작
    setVelocity(createNewVelocity());
  };

  if (!isMoving) {
    return <>{children}</>;
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full"
      // style={{ minHeight: '100%' }}
    >
      <motion.div
        animate={
          isPressing
            ? { x: 0, y: 0, rotate: 0 }
            : { x: position.x, y: position.y, rotate: rotation }
        }
        transition={
          isPressing
            ? { type: 'spring', stiffness: 300, damping: 30 }
            : { type: 'tween', duration: 0.05 }
        }
        onMouseDown={handlePressStart}
        onMouseUp={handlePressEnd}
        onMouseLeave={handlePressEnd}
        onTouchStart={handlePressStart}
        onTouchEnd={handlePressEnd}
        style={{ cursor: isMoving ? 'grab' : 'default' }}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default MovingCardWrapper;
