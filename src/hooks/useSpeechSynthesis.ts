import { useCallback, useEffect, useRef, useState } from 'react';

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

// 안드로이드 인터페이스 타입 정의
interface AndroidAudio {
  speakTTS: (text: string) => void;
  speakTTSWithLanguage: (text: string, lang: string) => void;
  setTTSLanguage: (lang: string) => boolean;
  setTTSSpeechRate: (rate: number) => void;
  stopTTS: () => void;
  isTTSSpeaking: () => boolean;
}

declare global {
  interface Window {
    AndroidAudio?: AndroidAudio;
    onAndroidTTSStateChange?: (isSpeaking: boolean, text: string | null) => void;
    onAndroidTTSError?: (message: string) => void;
  }
}

const LANG_MAP: Record<string, string> = {
  chinese: 'zh-CN',
  korean: 'ko-KR',
  english: 'en-US',
  japanese: 'ja-JP',
};

// 안드로이드 언어 코드 매핑
const ANDROID_LANG_MAP: Record<string, string> = {
  chinese: 'zh',
  korean: 'ko',
  english: 'en',
  japanese: 'ja',
  'zh-CN': 'zh',
  'ko-KR': 'ko',
  'en-US': 'en',
  'ja-JP': 'ja',
};

// 안드로이드 앱 여부 확인
const isAndroidApp = (): boolean => {
  return typeof window !== 'undefined' && !!window.AndroidAudio;
};

export const useSpeechSynthesis = (options: UseSpeechSynthesisOptions = {}): UseSpeechSynthesisReturn => {
  const { rate = 0.9, pauseBetweenRepeats = 2000 } = options;
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentRepeat, setCurrentRepeat] = useState(0);
  const cancelledRef = useRef(false);
  const resumeIntervalRef = useRef<number | null>(null);
  const androidTTSDoneResolveRef = useRef<(() => void) | null>(null);
  const androidTTSTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const androidTTSStartedRef = useRef(false); // TTS가 실제로 시작되었는지 추적

  // 안드로이드 TTS 상태 콜백 설정
  useEffect(() => {
    if (isAndroidApp()) {
      window.onAndroidTTSStateChange = (isSpeaking: boolean, _text: string | null) => {
        console.log('Android TTS state change:', isSpeaking, 'started:', androidTTSStartedRef.current, 'hasResolve:', !!androidTTSDoneResolveRef.current);

        if (isSpeaking) {
          // TTS가 실제로 시작됨
          androidTTSStartedRef.current = true;
        } else if (!isSpeaking && androidTTSStartedRef.current) {
          // TTS가 시작된 후에 완료된 경우
          androidTTSStartedRef.current = false;

          // 타임아웃 먼저 취소
          if (androidTTSTimeoutRef.current) {
            clearTimeout(androidTTSTimeoutRef.current);
            androidTTSTimeoutRef.current = null;
          }

          // resolve 호출
          if (androidTTSDoneResolveRef.current) {
            const resolveFunc = androidTTSDoneResolveRef.current;
            androidTTSDoneResolveRef.current = null;
            resolveFunc();
          }
        }
      };

      window.onAndroidTTSError = (message: string) => {
        console.error('Android TTS Error:', message);
        if (androidTTSDoneResolveRef.current) {
          // 타임아웃 먼저 취소
          if (androidTTSTimeoutRef.current) {
            clearTimeout(androidTTSTimeoutRef.current);
            androidTTSTimeoutRef.current = null;
          }
          const resolveFunc = androidTTSDoneResolveRef.current;
          androidTTSDoneResolveRef.current = null;
          resolveFunc();
        }
      };
    }

    return () => {
      window.onAndroidTTSStateChange = undefined;
      window.onAndroidTTSError = undefined;
    };
  }, []);

  const speak = useCallback(async (text: string, lang: string = 'chinese', repeat: number = 1) => {
    cancelledRef.current = false;
    setIsPlaying(true);
    setCurrentRepeat(0);

    // 안드로이드 앱인 경우 네이티브 TTS 사용
    if (isAndroidApp()) {
      const androidLang = ANDROID_LANG_MAP[lang] || 'zh';

      // 속도 설정 (안드로이드 기본 1.0, 웹 기본 0.9이므로 변환)
      window.AndroidAudio!.setTTSSpeechRate(rate / 0.9);

      const playOnceAndroid = (): Promise<void> => {
        return new Promise((resolve) => {
          if (cancelledRef.current) {
            resolve();
            return;
          }

          // 이전 타임아웃 정리
          if (androidTTSTimeoutRef.current) {
            clearTimeout(androidTTSTimeoutRef.current);
            androidTTSTimeoutRef.current = null;
          }

          // 이전 resolve가 있으면 먼저 정리
          if (androidTTSDoneResolveRef.current) {
            androidTTSDoneResolveRef.current = null;
          }

          // resolve 함수를 먼저 저장 (TTS 호출 전에 설정해야 콜백이 제대로 동작)
          androidTTSDoneResolveRef.current = resolve;

          // 타임아웃 설정 (15초 후 자동 resolve - 긴 문장 대비)
          androidTTSTimeoutRef.current = setTimeout(() => {
            console.log('Android TTS timeout - auto resolving');
            androidTTSTimeoutRef.current = null;
            if (androidTTSDoneResolveRef.current) {
              androidTTSDoneResolveRef.current = null;
              resolve();
            }
          }, 15000);

          // TTS 호출 (resolve 설정 후에 호출)
          if (!cancelledRef.current) {
            window.AndroidAudio!.speakTTSWithLanguage(text, androidLang);
          }
        });
      };

      try {
        for (let i = 0; i < repeat; i++) {
          if (cancelledRef.current) break;

          setCurrentRepeat(i + 1);
          await playOnceAndroid();

          if (i < repeat - 1 && !cancelledRef.current) {
            await new Promise(resolve => setTimeout(resolve, pauseBetweenRepeats));
          }
        }
      } finally {
        setIsPlaying(false);
        setCurrentRepeat(0);
      }
      return;
    }

    // 웹 브라우저인 경우 기존 speechSynthesis 사용
    if (!('speechSynthesis' in window)) {
      console.warn('SpeechSynthesis not supported');
      setIsPlaying(false);
      return;
    }

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

    // 안드로이드 앱인 경우
    if (isAndroidApp()) {
      window.AndroidAudio!.stopTTS();
      if (androidTTSDoneResolveRef.current) {
        androidTTSDoneResolveRef.current();
        androidTTSDoneResolveRef.current = null;
      }
    }

    // 웹 브라우저인 경우
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
