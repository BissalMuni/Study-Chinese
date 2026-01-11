import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

// localStorage 키 상수
const STORAGE_KEYS = {
  DARK_MODE: 'chineseStudy_darkMode',
  REPEAT_COUNT: 'chineseStudy_repeatCount',
  DISPLAY_MODE: 'chineseStudy_displayMode',
  SELECTED_TYPE: 'chineseStudy_selectedType',
  SELECTED_LESSON: 'chineseStudy_selectedLessonId',
  IS_AUTO_PLAY: 'chineseStudy_isAutoPlay',
  SENTENCE_INDEX: 'chineseStudy_currentSentenceIndex',
  VIEW_MODE: 'chineseStudy_viewMode',
  DATA_CATEGORY: 'chineseStudy_dataCategory',
  FONT_SIZE: 'chineseStudy_fontSize',
} as const;

// 표시 모드 타입
export type DisplayMode = 'chinese' | 'translations' | 'others' | 'words';
export type ViewMode = 'legacy' | 'new' | null;
export type DataCategory = 'currently' | 'integrated' | null;
export type IntegratedType = '01_초급반_제1-10과' | '02_중급반_제11-25과' | '03_고급반_제26-40과' | '04_실전회화_제41-50과' | '05_패턴_제1-90과';
export type CurrentlyType = '202508';

// 전역 상태 인터페이스
export interface GlobalState {
  isDarkMode: boolean;
  repeatCount: number;
  displayMode: DisplayMode;
  selectedType: IntegratedType | CurrentlyType | null;
  selectedLessonId: string | null;
  isAutoPlay: boolean;
  currentSentenceIndex: number;
  viewMode: ViewMode;
  dataCategory: DataCategory;
  fontSize: number;
  // 학습 진행 상태
  completedSentences: number;
  totalSentences: number;
  streakCount: number;
}

// Context 타입
interface GlobalStateContextType {
  state: GlobalState;
  updateState: <K extends keyof GlobalState>(key: K, value: GlobalState[K]) => void;
  resetProgress: () => void;
  incrementStreak: () => void;
}

const GlobalStateContext = createContext<GlobalStateContextType | undefined>(undefined);

// 초기 상태 가져오기
const getInitialState = (): GlobalState => {
  try {
    return {
      isDarkMode: localStorage.getItem(STORAGE_KEYS.DARK_MODE) === 'true',
      repeatCount: parseInt(localStorage.getItem(STORAGE_KEYS.REPEAT_COUNT) || '1'),
      displayMode: (localStorage.getItem(STORAGE_KEYS.DISPLAY_MODE) as DisplayMode) || 'chinese',
      selectedType: localStorage.getItem(STORAGE_KEYS.SELECTED_TYPE) as IntegratedType | CurrentlyType | null,
      selectedLessonId: localStorage.getItem(STORAGE_KEYS.SELECTED_LESSON),
      isAutoPlay: localStorage.getItem(STORAGE_KEYS.IS_AUTO_PLAY) === 'true',
      currentSentenceIndex: parseInt(localStorage.getItem(STORAGE_KEYS.SENTENCE_INDEX) || '0'),
      viewMode: localStorage.getItem(STORAGE_KEYS.VIEW_MODE) as ViewMode,
      dataCategory: localStorage.getItem(STORAGE_KEYS.DATA_CATEGORY) as DataCategory,
      fontSize: parseInt(localStorage.getItem(STORAGE_KEYS.FONT_SIZE) || '18'),
      completedSentences: 0,
      totalSentences: 0,
      streakCount: 0,
    };
  } catch (error) {
    console.error('초기 상태 로드 오류:', error);
    return {
      isDarkMode: false,
      repeatCount: 1,
      displayMode: 'chinese',
      selectedType: null,
      selectedLessonId: null,
      isAutoPlay: false,
      currentSentenceIndex: 0,
      viewMode: null,
      dataCategory: null,
      fontSize: 18,
      completedSentences: 0,
      totalSentences: 0,
      streakCount: 0,
    };
  }
};

// localStorage 저장 유틸리티
const saveToStorage = (key: string, value: string | number | boolean | null) => {
  try {
    if (value === null) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, String(value));
    }
  } catch (error) {
    console.error(`localStorage 저장 오류 (${key}):`, error);
  }
};

// Provider 컴포넌트
export const GlobalStateProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<GlobalState>(getInitialState);

  // 상태 변경 시 localStorage 동기화
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.DARK_MODE, state.isDarkMode);
    saveToStorage(STORAGE_KEYS.REPEAT_COUNT, state.repeatCount);
    saveToStorage(STORAGE_KEYS.DISPLAY_MODE, state.displayMode);
    saveToStorage(STORAGE_KEYS.SELECTED_TYPE, state.selectedType);
    saveToStorage(STORAGE_KEYS.SELECTED_LESSON, state.selectedLessonId);
    saveToStorage(STORAGE_KEYS.IS_AUTO_PLAY, state.isAutoPlay);
    saveToStorage(STORAGE_KEYS.SENTENCE_INDEX, state.currentSentenceIndex);
    saveToStorage(STORAGE_KEYS.VIEW_MODE, state.viewMode);
    saveToStorage(STORAGE_KEYS.DATA_CATEGORY, state.dataCategory);
    saveToStorage(STORAGE_KEYS.FONT_SIZE, state.fontSize);
  }, [state]);

  // 다크모드 클래스 토글
  useEffect(() => {
    if (state.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.isDarkMode]);

  // 상태 업데이트 함수
  const updateState = useCallback(<K extends keyof GlobalState>(key: K, value: GlobalState[K]) => {
    setState(prev => {
      if (prev[key] === value) return prev;
      return { ...prev, [key]: value };
    });
  }, []);

  // 진행 상태 초기화
  const resetProgress = useCallback(() => {
    setState(prev => ({
      ...prev,
      completedSentences: 0,
      currentSentenceIndex: 0,
    }));
  }, []);

  // 연속 학습 횟수 증가
  const incrementStreak = useCallback(() => {
    setState(prev => ({
      ...prev,
      streakCount: prev.streakCount + 1,
    }));
  }, []);

  // 페이지 언로드 시 저장
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveToStorage(STORAGE_KEYS.SENTENCE_INDEX, state.currentSentenceIndex);
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [state.currentSentenceIndex]);

  return (
    <GlobalStateContext.Provider value={{ state, updateState, resetProgress, incrementStreak }}>
      {children}
    </GlobalStateContext.Provider>
  );
};

// 커스텀 훅
export const useGlobalState = () => {
  const context = useContext(GlobalStateContext);
  if (!context) {
    throw new Error('useGlobalState must be used within GlobalStateProvider');
  }
  return context;
};

export default GlobalStateContext;
