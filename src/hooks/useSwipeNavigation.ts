import { useState, useCallback, TouchEvent } from 'react';

interface SwipeHandlers {
  onTouchStart: (e: TouchEvent) => void;
  onTouchMove: (e: TouchEvent) => void;
  onTouchEnd: (e: TouchEvent) => void;
}

interface UseSwipeNavigationOptions {
  minSwipeDistance?: number;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  preventDefaultOnSwipe?: boolean;
}

export const useSwipeNavigation = (options: UseSwipeNavigationOptions = {}): SwipeHandlers => {
  const {
    minSwipeDistance = 50,
    onSwipeUp,
    onSwipeDown,
    onSwipeLeft,
    onSwipeRight,
    preventDefaultOnSwipe = true,
  } = options;

  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);

  const onTouchStart = useCallback((e: TouchEvent) => {
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  }, []);

  const onTouchMove = useCallback((e: TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });

    // Pull-to-refresh 방지
    if (preventDefaultOnSwipe && touchStart) {
      const diffY = e.targetTouches[0].clientY - touchStart.y;
      if (diffY > 0 && window.scrollY === 0) {
        e.preventDefault();
      }
    }
  }, [touchStart, preventDefaultOnSwipe]);

  const onTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;

    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const absX = Math.abs(distanceX);
    const absY = Math.abs(distanceY);

    // 수직 스와이프가 수평보다 클 때
    if (absY > absX && absY > minSwipeDistance) {
      if (distanceY > 0) {
        // 위로 스와이프
        onSwipeUp?.();
      } else {
        // 아래로 스와이프
        onSwipeDown?.();
      }
    }
    // 수평 스와이프가 수직보다 클 때
    else if (absX > absY && absX > minSwipeDistance) {
      if (distanceX > 0) {
        // 왼쪽으로 스와이프
        onSwipeLeft?.();
      } else {
        // 오른쪽으로 스와이프
        onSwipeRight?.();
      }
    }

    setTouchStart(null);
    setTouchEnd(null);
  }, [touchStart, touchEnd, minSwipeDistance, onSwipeUp, onSwipeDown, onSwipeLeft, onSwipeRight]);

  return { onTouchStart, onTouchMove, onTouchEnd };
};
