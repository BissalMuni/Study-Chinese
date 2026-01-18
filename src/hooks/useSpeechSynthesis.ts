import { useCallback, useRef, useState } from 'react';

interface UseSpeechSynthesisOptions {
  rate?: number;
  pauseBetweenRepeats?: number;
}

interface UseSpeechSynthesisReturn {
  speak: (text: string, lang?: string, repeat?: number) => Promise<void>;
  stop: () => void;
  isPlaying: boolean;
  currentRepeat: number;
}

const LANG_MAP: Record<string, string> = {
  chinese: 'zh-CN',
  korean: 'ko-KR',
  english: 'en-US',
  japanese: 'ja-JP',
};

export const useSpeechSynthesis = (options: UseSpeechSynthesisOptions = {}): UseSpeechSynthesisReturn => {
  const { rate = 0.9, pauseBetweenRepeats = 2000 } = options;
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentRepeat, setCurrentRepeat] = useState(0);
  const cancelledRef = useRef(false);

  const speak = useCallback(async (text: string, lang: string = 'chinese', repeat: number = 1) => {
    if (!('speechSynthesis' in window)) {
      console.warn('SpeechSynthesis not supported');
      return;
    }

    cancelledRef.current = false;
    setIsPlaying(true);
    setCurrentRepeat(0);
    window.speechSynthesis.cancel();

    const langCode = LANG_MAP[lang] || lang;

    const playOnce = (): Promise<void> => {
      return new Promise((resolve) => {
        if (cancelledRef.current) {
          resolve();
          return;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = langCode;
        utterance.rate = rate;

        utterance.onend = () => resolve();
        utterance.onerror = () => resolve();

        window.speechSynthesis.speak(utterance);
      });
    };

    try {
      for (let i = 0; i < repeat; i++) {
        if (cancelledRef.current) break;

        setCurrentRepeat(i + 1);
        await playOnce();

        // 마지막 반복이 아니면 휴지 시간
        if (i < repeat - 1 && !cancelledRef.current) {
          await new Promise(resolve => setTimeout(resolve, pauseBetweenRepeats));
        }
      }
    } finally {
      setIsPlaying(false);
      setCurrentRepeat(0);
    }
  }, [rate, pauseBetweenRepeats]);

  const stop = useCallback(() => {
    cancelledRef.current = true;
    window.speechSynthesis?.cancel();
    setIsPlaying(false);
    setCurrentRepeat(0);
  }, []);

  return { speak, stop, isPlaying, currentRepeat };
};
