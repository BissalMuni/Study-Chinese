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
  const resumeIntervalRef = useRef<number | null>(null);

  const speak = useCallback(async (text: string, lang: string = 'chinese', repeat: number = 1) => {
    if (!('speechSynthesis' in window)) {
      console.warn('SpeechSynthesis not supported');
      return;
    }

    cancelledRef.current = false;
    setIsPlaying(true);
    setCurrentRepeat(0);
    window.speechSynthesis.cancel();

    // Chrome 버그 workaround: 일정 간격으로 resume() 호출
    if (resumeIntervalRef.current) {
      clearInterval(resumeIntervalRef.current);
    }
    resumeIntervalRef.current = window.setInterval(() => {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    }, 200);

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

        // 특정 언어에 맞는 음성 선택 시도
        const voices = window.speechSynthesis.getVoices();
        const matchingVoice = voices.find(v => v.lang.startsWith(langCode.split('-')[0]));
        if (matchingVoice) {
          utterance.voice = matchingVoice;
        }

        utterance.onend = () => resolve();
        utterance.onerror = (event) => {
          console.error('SpeechSynthesis error:', event.error);
          resolve(); // 에러가 나도 계속 진행
        };

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
      // interval 정리
      if (resumeIntervalRef.current) {
        clearInterval(resumeIntervalRef.current);
        resumeIntervalRef.current = null;
      }
      setIsPlaying(false);
      setCurrentRepeat(0);
    }
  }, [rate, pauseBetweenRepeats]);

  const stop = useCallback(() => {
    cancelledRef.current = true;
    // interval 정리
    if (resumeIntervalRef.current) {
      clearInterval(resumeIntervalRef.current);
      resumeIntervalRef.current = null;
    }
    window.speechSynthesis?.cancel();
    setIsPlaying(false);
    setCurrentRepeat(0);
  }, []);

  return { speak, stop, isPlaying, currentRepeat };
};
