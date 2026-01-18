import { useState, useCallback, useEffect, useRef } from 'react';
import { IntegratedType, CurrentlyType } from '../contexts/GlobalStateContext';

export interface Sentence {
  id: number;
  sentence: string;
  pinyin: string;
  korean: string;
  english?: string;
  japanese?: string;
  japanese_romaji?: string;
  words?: {
    words: string[];
    pinyin: string[];
    korean: string[];
    traditional?: string[];
    meaning_and_reading?: string[];
  };
}

interface Subcategory {
  subcategory: string;
  sentences: Sentence[];
}

interface CategoryContent {
  category: string;
  subcategories: Subcategory[];
}

interface LessonContent {
  lesson: number;
  content: CategoryContent[];
}

interface LessonData {
  course?: string;
  lessons?: string;
  language: string;
  contents: LessonContent[];
}

interface LessonInfo {
  lesson: number | string;
  id: number | string;
  category: string;
}

interface UseLessonDataParams {
  selectedType?: IntegratedType | CurrentlyType | null;
  selectedLessonId?: string | null;
}

interface UseLessonDataReturn {
  lessonData: LessonData | null;
  lessons: LessonInfo[];
  allSentences: Sentence[];
  loading: boolean;
  error: string | null;
  loadLessonData: (type: IntegratedType | CurrentlyType) => Promise<void>;
  selectLesson: (lessonName: string) => void;
  selectedLessonContent: LessonContent[] | null;
}

export const useLessonData = (params?: UseLessonDataParams): UseLessonDataReturn => {
  const [lessonData, setLessonData] = useState<LessonData | null>(null);
  const [selectedLessonContent, setSelectedLessonContent] = useState<LessonContent[] | null>(null);
  const [allSentences, setAllSentences] = useState<Sentence[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadedTypeRef = useRef<string | null>(null);
  const selectedLessonRef = useRef<string | null>(null);

  // 레슨 목록 추출
  const lessons: LessonInfo[] = lessonData?.contents?.reduce((acc: LessonInfo[], item) => {
    const lessonNum = item.lesson;
    const category = item.content?.[0]?.category || '';
    if (!acc.find(l => l.lesson === lessonNum)) {
      acc.push({ lesson: lessonNum, id: lessonNum, category });
    }
    return acc;
  }, []) || [];

  // 데이터 로드
  const loadLessonData = useCallback(async (type: IntegratedType | CurrentlyType) => {
    // 이미 로드된 타입이면 스킵
    if (loadedTypeRef.current === type && lessonData) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let url: string;
      // Currently 타입은 숫자로 시작 (예: 202508)
      if (/^\d+$/.test(type)) {
        url = `/data/currently/${type}.json`;
      } else {
        url = `/data/integrated/${type}.json`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to load data: ${response.status}`);
      }

      const data: LessonData = await response.json();
      setLessonData(data);
      loadedTypeRef.current = type;
      setSelectedLessonContent(null);
      setAllSentences([]);
      selectedLessonRef.current = null;
    } catch (err) {
      console.error('Failed to load lesson data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [lessonData]);

  // 레슨 선택
  const selectLesson = useCallback((lessonName: string) => {
    if (!lessonData?.contents) return;
    if (selectedLessonRef.current === lessonName && allSentences.length > 0) return;

    const lessonContent = lessonData.contents.filter((item) => {
      return String(item.lesson) === String(lessonName) ||
        item.lesson === parseInt(lessonName);
    });

    setSelectedLessonContent(lessonContent);
    selectedLessonRef.current = lessonName;

    // 모든 문장 추출
    const sentences: Sentence[] = [];
    lessonContent.forEach((lessonItem) => {
      lessonItem.content?.forEach((categoryItem) => {
        categoryItem.subcategories?.forEach((subcat) => {
          if (subcat.sentences) {
            sentences.push(...subcat.sentences);
          }
        });
      });
    });

    setAllSentences(sentences);
  }, [lessonData, allSentences.length]);

  // params에서 selectedType이 변경되면 자동 로드
  useEffect(() => {
    if (params?.selectedType && params.selectedType !== loadedTypeRef.current) {
      loadLessonData(params.selectedType);
    }
  }, [params?.selectedType, loadLessonData]);

  // 데이터 로드 후 selectedLessonId가 있으면 자동 선택
  useEffect(() => {
    if (lessonData && params?.selectedLessonId && params.selectedLessonId !== selectedLessonRef.current) {
      selectLesson(params.selectedLessonId);
    }
  }, [lessonData, params?.selectedLessonId, selectLesson]);

  return {
    lessonData,
    lessons,
    allSentences,
    loading,
    error,
    loadLessonData,
    selectLesson,
    selectedLessonContent,
  };
};
