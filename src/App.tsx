import React, { useState, useEffect, useCallback, useRef } from 'react';
import './styles/App.css';
import LegacyApp from './components/LegacyApp';

type ViewMode = 'legacy' | 'new';
type DataCategory = 'currently' | 'integrated';
type IntegratedType = '01_초급반_제1-10과' | '02_중급반_제11-25과' | '03_고급반_제26-40과' | '04_실전회화_제41-50과' | '05_패턴_제1-90과';
type CurrentlyType = '202508';
type DisplayMode = 'chinese' | 'translations' | 'others' | 'words';

interface LessonData {
  id: number;
  lesson?: string;
  sentence?: string;
  pinyin?: string;
  korean?: string;
  english?: string;
  japanese?: string;
  japanese_romaji?: string;
  words?: any[];
}

function App() {
  const [viewMode, setViewMode] = useState<ViewMode | null>(null);
  const [dataCategory, setDataCategory] = useState<DataCategory | null>(null);
  const [selectedType, setSelectedType] = useState<IntegratedType | CurrentlyType | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<LessonData[] | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [displayMode, setDisplayMode] = useState<DisplayMode>('chinese');
  const [lessonData, setLessonData] = useState<any>(null);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState<number>(0);
  const [allSentences, setAllSentences] = useState<any[]>([]);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('chineseStudy_darkMode');
    return saved === 'true';
  });
  const [showTranslations, setShowTranslations] = useState<boolean>(false);
  const [showLessonModal, setShowLessonModal] = useState<boolean>(false);
  const [nextLessonDirection, setNextLessonDirection] = useState<'prev' | 'next' | null>(null);
  const [targetLessonNum, setTargetLessonNum] = useState<number | null>(null);
  const [repeatCount, setRepeatCount] = useState<number>(() => {
    const saved = localStorage.getItem('chineseStudy_repeatCount');
    return saved ? parseInt(saved) : 1;
  });

  // repeatCount를 ref로도 관리하여 항상 최신 값 참조
  const repeatCountRef = useRef<number>(repeatCount);
  useEffect(() => {
    repeatCountRef.current = repeatCount;
  }, [repeatCount]);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isAutoPlay, setIsAutoPlay] = useState<boolean>(() => {
    const saved = localStorage.getItem('chineseStudy_isAutoPlay');
    return saved === 'true';
  });

  // Ref for lesson buttons to enable auto-scroll
  const lessonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  // 이전 레슨 ID를 추적하는 ref
  const previousLessonIdRef = useRef<string | null>(null);

  // 자동 재생 취소를 추적하는 ref
  const autoPlayCancelledRef = useRef<boolean>(false);

  // 휴지시간 상수
  const REPEAT_PAUSE_TIME = 2000; // 반복 사이 휴지시간 (1.5초)
  const LESSON_PAUSE_TIME = REPEAT_PAUSE_TIME * 2.5; // 레슨 경계 휴지시간 (3초)


  // Auto-scroll to selected lesson when lesson list is shown
  useEffect(() => {
    if (selectedType && !selectedLesson && lessonData && selectedLessonId) {
      // Small delay to ensure refs are populated after render
      const timer = setTimeout(() => {
        const targetButton = lessonRefs.current[selectedLessonId];
        console.log('🔍 Scroll attempt:', {
          selectedLessonId,
          targetButton,
          allRefs: Object.keys(lessonRefs.current)
        });

        if (targetButton) {
          targetButton.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
          console.log('✅ Scrolled to lesson:', selectedLessonId);
        } else {
          console.log('❌ Button not found for lesson:', selectedLessonId);
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [selectedType, selectedLesson, lessonData, selectedLessonId]);

  // Helper functions defined before useEffects
  const extractAllSentences = useCallback((contents: any[]) => {
    const sentences: any[] = [];
    contents.forEach((lessonItem: any) => {
      if (lessonItem.content) {
        lessonItem.content.forEach((categoryItem: any) => {
          if (categoryItem.subcategories) {
            categoryItem.subcategories.forEach((subcat: any) => {
              if (subcat.sentences) {
                sentences.push(...subcat.sentences);
              }
            });
          }
        });
      }
    });
    setAllSentences(sentences);
    setCurrentSentenceIndex(0);
  }, []);

  const selectLesson = useCallback((lessonName: string, data?: any) => {
    const targetData = data || lessonData;
    if (targetData && targetData.contents) {
      console.log('Searching for lesson:', lessonName);
      console.log('First item lesson field:', targetData.contents[0]?.lesson);

      const lessonContent = targetData.contents.filter((item: any) => {
        // 숫자와 문자열 모두 비교 (타입 변환)
        return String(item.lesson) === String(lessonName) ||
          item.lesson === parseInt(lessonName) ||
          `Lesson ${item.lesson || item.id}` === lessonName;
      });

      console.log('selectedLesson 예시 3개:', lessonContent.slice(0, 3));
      setSelectedLesson(lessonContent);
      setSelectedLessonId(lessonName);
      extractAllSentences(lessonContent);
    }
  }, [lessonData, extractAllSentences]);

  const loadLessonData = useCallback(async (type: IntegratedType | CurrentlyType) => {
    try {
      let url;
      if (type === '202508') {
        url = `/data/currently/${type}.json`;
      } else {
        url = `/data/integrated/${type}.json`;
      }

      const response = await fetch(url);
      const data = await response.json();
      setLessonData(data);

      // Extract unique lessons for lesson selection
      if (data.contents && Array.isArray(data.contents)) {
        const lessons = data.contents.reduce((acc: any[], item: any) => {
          const lessonNum = item.lesson || `Lesson ${item.lesson || item.id}`;
          if (!acc.find(l => l.lesson === lessonNum)) {
            acc.push({ lesson: lessonNum, id: item.lesson || item.id });
          }
          return acc;
        }, []);

        if (lessons.length === 1) {
          // If only one lesson, go directly to content
          setSelectedLesson(data.contents);
          setSelectedLessonId(lessons[0].lesson);
          extractAllSentences(data.contents);
        }
      } else {
        // If no contents array, treat the whole data as lesson content
        setSelectedLesson([data]);
      }
    } catch (error) {
      console.error('Failed to load lesson data:', error);
    }
  }, [extractAllSentences]);

  // localStorage에서 상태 복원
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('chineseStudy_darkMode');
    const savedViewMode = localStorage.getItem('chineseStudy_viewMode');
    const savedDataCategory = localStorage.getItem('chineseStudy_dataCategory');
    const savedSelectedType = localStorage.getItem('chineseStudy_selectedType');
    const savedSelectedLessonId = localStorage.getItem('chineseStudy_selectedLessonId');
    const savedCurrentSentenceIndex = localStorage.getItem('chineseStudy_currentSentenceIndex');
    const savedDisplayMode = localStorage.getItem('chineseStudy_displayMode');

    if (savedDarkMode) setIsDarkMode(savedDarkMode === 'true');
    if (savedViewMode) setViewMode(savedViewMode as ViewMode);
    if (savedDataCategory) {
      setDataCategory(savedDataCategory as DataCategory);
      if (savedSelectedType) {
        if (savedDataCategory === 'currently') {
          setSelectedType(savedSelectedType as CurrentlyType);
        } else if (savedDataCategory === 'integrated') {
          setSelectedType(savedSelectedType as IntegratedType);
        }
      }
      if (savedSelectedLessonId) setSelectedLessonId(savedSelectedLessonId);
      if (savedCurrentSentenceIndex) setCurrentSentenceIndex(parseInt(savedCurrentSentenceIndex));
      if (savedDisplayMode) setDisplayMode(savedDisplayMode as DisplayMode);
    }
  }, []);

  // 상태 변경시 localStorage에 저장
  useEffect(() => {
    localStorage.setItem('chineseStudy_darkMode', isDarkMode.toString());
  }, [isDarkMode]);

  useEffect(() => {
    if (viewMode) localStorage.setItem('chineseStudy_viewMode', viewMode);
  }, [viewMode]);

  useEffect(() => {
    if (dataCategory) localStorage.setItem('chineseStudy_dataCategory', dataCategory);
  }, [dataCategory]);

  useEffect(() => {
    localStorage.setItem('chineseStudy_currentSentenceIndex', currentSentenceIndex.toString());
  }, [currentSentenceIndex]);

  useEffect(() => {
    localStorage.setItem('chineseStudy_displayMode', displayMode);
  }, [displayMode]);

  useEffect(() => {
    localStorage.setItem('chineseStudy_repeatCount', repeatCount.toString());
  }, [repeatCount]);

  useEffect(() => {
    localStorage.setItem('chineseStudy_isAutoPlay', isAutoPlay.toString());
  }, [isAutoPlay]);

  useEffect(() => {
    if (selectedLessonId) {
      localStorage.setItem('chineseStudy_selectedLessonId', selectedLessonId);
    } else {
      localStorage.removeItem('chineseStudy_selectedLessonId');
    }
  }, [selectedLessonId]);

  useEffect(() => {
    if (selectedType) {
      localStorage.setItem('chineseStudy_selectedType', selectedType);
    } else {
      localStorage.removeItem('chineseStudy_selectedType');
    }
  }, [selectedType]);

  // selectedType 변경 시 데이터 로드
  useEffect(() => {
    if (selectedType && !lessonData) {
      console.log('Loading lesson data for type:', selectedType);
      loadLessonData(selectedType).then(() => {
        console.log('Lesson data loaded successfully');
      });
    }
  }, [selectedType, lessonData, loadLessonData]);

  // Restore lesson when lessonData is loaded and selectedLessonId exists
  useEffect(() => {
    if (lessonData && selectedLessonId) {
      selectLesson(selectedLessonId);
    }
  }, [lessonData, selectedLessonId, selectLesson]);

  // 자동 재생 세션 ID 관리
  const autoPlaySessionRef = useRef<number>(0);

  // 자동 모드에서 수동 모드로 전환 시 오디오 중지
  useEffect(() => {
    if (!isAutoPlay) {
      // 자동 재생 취소 플래그 설정
      autoPlayCancelledRef.current = true;
      // 세션 ID 증가로 이전 재생 무효화
      autoPlaySessionRef.current += 1;
      // 오디오 중지
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }
  }, [isAutoPlay]);

  // 자동 모드 켜질 때 자동 재생 시작
  useEffect(() => {
    if (isAutoPlay && allSentences.length > 0) {
      console.log('🚀 Auto mode turned on, starting playback from index:', currentSentenceIndex);
      autoPlayCancelledRef.current = false;
      const currentSession = ++autoPlaySessionRef.current;

      // 약간의 지연 후 재생 시작
      setTimeout(() => {
        if (autoPlaySessionRef.current === currentSession && isAutoPlay) {
          playAutoWithNavigation(currentSentenceIndex);
        }
      }, 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAutoPlay]); // isAutoPlay만 감지 - repeatCount 변경 시 재시작하지 않음

  // 자동 모드에서 레슨이 변경되면 자동 재생 시작
  useEffect(() => {
    console.log('🔍 Lesson change effect - isAutoPlay:', isAutoPlay, 'selectedLessonId:', selectedLessonId, 'previous:', previousLessonIdRef.current);

    if (isAutoPlay && selectedLessonId && previousLessonIdRef.current !== selectedLessonId) {
      // 레슨이 변경되었고, 자동 재생 모드라면
      if (previousLessonIdRef.current !== null && allSentences.length > 0) {
        console.log('🎯 Starting auto play for new lesson, sentences:', allSentences.length);
        // 새 레슨의 첫 문장부터 자동 재생 시작
        const timer = setTimeout(() => {
          if (!autoPlayCancelledRef.current && isAutoPlay) {
            console.log('✅ Triggering auto play from index 0');
            setCurrentSentenceIndex(0);
            playAutoWithNavigation(0);
          } else {
            console.log('⚠️ Auto play cancelled or not in auto mode');
          }
        }, 100);

        return () => clearTimeout(timer);
      }
      previousLessonIdRef.current = selectedLessonId;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLessonId, isAutoPlay, allSentences, repeatCount]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // 스와이프 최소 거리 (픽셀)
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientY);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY);

    // pull-to-refresh 방지
    if (touchStart !== null) {
      const currentTouch = e.targetTouches[0].clientY;
      const diff = currentTouch - touchStart;

      // 아래로 스와이프 중이면 기본 동작 방지
      if (diff > 0) {
        e.preventDefault();
      }
    }
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isUpSwipe = distance > minSwipeDistance;
    const isDownSwipe = distance < -minSwipeDistance;

    if (isUpSwipe) {
      // 위로 스와이프 - 다음 문장 (수동 이동)
      navigateManual('next');
    }

    if (isDownSwipe) {
      // 아래로 스와이프 - 이전 문장 (수동 이동)
      navigateManual('prev');
    }
  };

  // ============ 수동 재생: 문장 이동 없음, 반복 횟수만 적용 ============
  const playManual = async (text: string, lang?: string, repeat: number = 1) => {
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();

        const playOnce = () => {
          return new Promise<void>((resolve) => {
            const utterance = new SpeechSynthesisUtterance(text);

            // 언어별 설정
            if (lang === 'chinese') {
              utterance.lang = 'zh-CN';
            } else if (lang === 'korean') {
              utterance.lang = 'ko-KR';
            } else if (lang === 'english') {
              utterance.lang = 'en-US';
            } else if (lang === 'japanese') {
              utterance.lang = 'ja-JP';
            } else {
              utterance.lang = 'zh-CN'; // 기본값
            }

            utterance.rate = 0.9;
            utterance.onend = () => resolve();
            utterance.onerror = () => resolve();
            window.speechSynthesis.speak(utterance);
          });
        };

        // 반복 재생만 수행 (문장 이동 없음)
        for (let i = 0; i < repeat; i++) {
          await playOnce();

          if (i < repeat - 1) {
            await new Promise(resolve => setTimeout(resolve, REPEAT_PAUSE_TIME));
          }
        }
      }
    } catch (error) {
      console.error('Manual playback error:', error);
    }
  };

  // ============ 자동 재생: 문장 이동 포함, 반복 횟수 적용 ============
  const playAutoWithNavigation = useCallback(async (startIndex: number) => {
    console.log('🎬 Auto play started from index:', startIndex, 'total sentences:', allSentences.length);
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();

        const playOnce = (text: string) => {
          return new Promise<void>((resolve) => {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'zh-CN';
            utterance.rate = 0.9;
            utterance.onend = () => resolve();
            utterance.onerror = () => resolve();
            window.speechSynthesis.speak(utterance);
          });
        };

        let currentIdx = startIndex;

        while (currentIdx < allSentences.length) {
          console.log('🔄 Loop iteration - currentIdx:', currentIdx, 'cancelled:', autoPlayCancelledRef.current);

          // 취소 확인
          if (autoPlayCancelledRef.current) {
            console.log('❌ Auto play cancelled');
            autoPlayCancelledRef.current = false;
            return;
          }

          const sentence = allSentences[currentIdx]?.sentence;
          if (!sentence) {
            console.log('❌ No sentence at index:', currentIdx);
            break;
          }

          // 문장 인덱스 업데이트 (재생 전에)
          console.log('📍 Setting index to:', currentIdx, 'sentence:', sentence.substring(0, 20));
          setCurrentSentenceIndex(currentIdx);

          // 현재 반복 횟수 가져오기 (ref에서 최신 값)
          const currentRepeatCount = repeatCountRef.current;
          console.log('🔢 Current repeat count:', currentRepeatCount);

          // 문장 반복 재생
          for (let i = 0; i < currentRepeatCount; i++) {
            if (autoPlayCancelledRef.current) {
              console.log('❌ Auto play cancelled during repeat');
              autoPlayCancelledRef.current = false;
              return;
            }

            console.log('🔊 Playing repeat', i + 1, 'of', currentRepeatCount);
            await playOnce(sentence);

            if (i < currentRepeatCount - 1) {
              await new Promise(resolve => setTimeout(resolve, REPEAT_PAUSE_TIME));
            }
          }

          // 마지막 문장인지 확인
          if (currentIdx >= allSentences.length - 1) {
            console.log('📝 Last sentence reached');
            // 다음 레슨으로 이동 시도
            const currentLessonNum = parseInt(selectedLessonId || '0');
            const nextLessonNum = currentLessonNum + 1;

            if (lessonData && lessonData.contents) {
              const nextLessonExists = lessonData.contents.some(
                (item: any) => String(item.lesson) === String(nextLessonNum) || item.lesson === nextLessonNum
              );

              if (nextLessonExists) {
                console.log('➡️ Moving to next lesson:', nextLessonNum);
                await new Promise(resolve => setTimeout(resolve, LESSON_PAUSE_TIME));

                if (autoPlayCancelledRef.current) {
                  console.log('❌ Auto play cancelled before lesson change');
                  autoPlayCancelledRef.current = false;
                  return;
                }

                selectLesson(String(nextLessonNum));
                return; // 레슨 변경 후 useEffect에서 자동 재생 재시작
              }
            }
            break;
          } else {
            // 다음 문장으로 이동
            console.log('⏭️ Moving to next sentence...');
            await new Promise(resolve => setTimeout(resolve, REPEAT_PAUSE_TIME));

            if (autoPlayCancelledRef.current) {
              console.log('❌ Auto play cancelled before next sentence');
              autoPlayCancelledRef.current = false;
              return;
            }

            currentIdx++;
            console.log('✅ Incremented to:', currentIdx);
          }
        }
        console.log('🏁 Auto play finished');
      }
    } catch (error) {
      console.error('Auto playback error:', error);
    }
  }, [allSentences, selectedLessonId, lessonData, selectLesson, REPEAT_PAUSE_TIME, LESSON_PAUSE_TIME]); // repeatCount는 ref로 참조하므로 제외

  // ============ 수동 문장 이동: 재생 없음, 인덱스만 변경 ============
  const navigateManual = (direction: 'prev' | 'next') => {
    if (direction === 'next') {
      if (currentSentenceIndex >= allSentences.length - 1) {
        // 마지막 문장에서 다음 레슨으로 이동 확인 모달
        const currentLessonNum = parseInt(selectedLessonId || '0');
        const nextLessonNum = currentLessonNum + 1;

        if (lessonData && lessonData.contents) {
          const nextLessonExists = lessonData.contents.some(
            (item: any) => String(item.lesson) === String(nextLessonNum) || item.lesson === nextLessonNum
          );

          if (nextLessonExists) {
            setTargetLessonNum(nextLessonNum);
            setNextLessonDirection('next');
            setShowLessonModal(true);
          }
        }
      } else {
        setCurrentSentenceIndex(currentSentenceIndex + 1);
      }
    } else {
      if (currentSentenceIndex === 0) {
        // 첫 문장에서 이전 레슨으로 이동 확인 모달
        const currentLessonNum = parseInt(selectedLessonId || '0');
        const prevLessonNum = currentLessonNum - 1;

        if (prevLessonNum >= 1) {
          setTargetLessonNum(prevLessonNum);
          setNextLessonDirection('prev');
          setShowLessonModal(true);
        }
      } else {
        setCurrentSentenceIndex(currentSentenceIndex - 1);
      }
    }
  };

  const goBack = () => {
    if (selectedLesson) {
      setSelectedLesson(null);
      // Keep selectedLessonId for auto-scroll when returning to lesson list
      // setSelectedLessonId(null); // ← 주석 처리: 레슨 목록으로 돌아갈 때 ID 유지
      setDisplayMode('chinese');
      // Don't clear selectedLessonId from localStorage - keep it for scroll position
      // localStorage.removeItem('chineseStudy_selectedLessonId'); // ← 주석 처리
    } else if (selectedType) {
      setSelectedType(null);
      setLessonData(null);
      setSelectedLessonId(null); // Clear lesson ID when changing type
      // Clear type-related localStorage
      localStorage.removeItem('chineseStudy_selectedType');
      localStorage.removeItem('chineseStudy_selectedLessonId');
    } else if (dataCategory) {
      setDataCategory(null);
      // Clear category-related localStorage
      localStorage.removeItem('chineseStudy_dataCategory');
    } else if (viewMode) {
      // Clear all localStorage when going back to main screen
      localStorage.removeItem('chineseStudy_viewMode');
      localStorage.removeItem('chineseStudy_dataCategory');
      // Clear unified localStorage
      localStorage.removeItem('chineseStudy_selectedType');
      localStorage.removeItem('chineseStudy_selectedLessonId');
      localStorage.removeItem('chineseStudy_currentSentenceIndex');
      localStorage.removeItem('chineseStudy_displayMode');
      setViewMode(null);
      setDataCategory(null);
      setSelectedType(null);
      setSelectedLesson(null);
      setLessonData(null);
      setAllSentences([]);
    }
  };

  // Initial view mode selection
  if (!viewMode) {
    return (
      <div className={`app ${isDarkMode ? 'dark-mode' : ''}`}>
        <button
          className="theme-toggle-top"
          onClick={toggleDarkMode}
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>
        <div className="view-mode-selection">
          <h1>중국어 학습</h1>
          <div className="view-mode-buttons">
            <button onClick={() => setViewMode('legacy')} className="view-mode-btn">
              Past/Present
            </button>
            <button onClick={() => setViewMode('new')} className="view-mode-btn">
              Currently/Integrated
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Legacy UI (기존 UI 그대로 유지)
  if (viewMode === 'legacy') {
    return <LegacyApp onBackClick={goBack} isDarkMode={isDarkMode} />;
  }

  // New UI
  if (viewMode === 'new') {
    // Data category selection
    if (!dataCategory) {
      return (
        <div className={`app ${isDarkMode ? 'dark-mode' : ''}`}>
          <div className="header-with-center">
            <button onClick={goBack} className="back-btn">🔙</button>

            <div className="header-spacer"></div>
          </div>
          <div className="data-category-selection">
            <button onClick={() => setDataCategory('currently')} className="category-btn">
              Currently
            </button>
            <button onClick={() => setDataCategory('integrated')} className="category-btn">
              Integrated
            </button>
          </div>
        </div>
      );
    }

    // Type selection
    if (!selectedType) {
      return (
        <div className={`app ${isDarkMode ? 'dark-mode' : ''}`}>
          <div className="header-with-center">
            <button onClick={goBack} className="back-btn">🔙</button>
            <h2 className="header-title-center">{dataCategory === 'currently' ? 'Currently' : 'Integrated'}</h2>
            <div className="header-spacer"></div>
          </div>
          <div className="type-selection">
            {dataCategory === 'integrated' ? (
              <>
                <button onClick={() => { setSelectedType('01_초급반_제1-10과'); loadLessonData('01_초급반_제1-10과'); }} className="type-btn">초급반 (제1-10과)</button>
                <button onClick={() => { setSelectedType('02_중급반_제11-25과'); loadLessonData('02_중급반_제11-25과'); }} className="type-btn">중급반 (제11-25과)</button>
                <button onClick={() => { setSelectedType('03_고급반_제26-40과'); loadLessonData('03_고급반_제26-40과'); }} className="type-btn">고급반 (제26-40과)</button>
                <button onClick={() => { setSelectedType('04_실전회화_제41-50과'); loadLessonData('04_실전회화_제41-50과'); }} className="type-btn">실전회화 (제41-50과)</button>
                <button onClick={() => { setSelectedType('05_패턴_제1-90과'); loadLessonData('05_패턴_제1-90과'); }} className="type-btn">패턴회화 (제1-30과)</button>
              </>
            ) : (
              <button onClick={() => { setSelectedType('202508'); loadLessonData('202508' as any); }} className="type-btn">202508</button>
            )}
          </div>
        </div>
      );
    }

    // Lesson selection (if multiple lessons exist)
    if (selectedType && !selectedLesson && lessonData && lessonData.contents) {
      const lessons = lessonData.contents.reduce((acc: any[], item: any) => {
        const lessonNum = item.lesson || `Lesson ${item.lesson || item.id}`;
        const category = item.content?.[0]?.category || '';
        if (!acc.find(l => l.lesson === lessonNum)) {
          acc.push({
            lesson: lessonNum,
            id: item.lesson || item.id,
            category: category
          });
        }
        return acc;
      }, []);

      if (lessons.length > 1) {
        return (
          <div className={`app ${isDarkMode ? 'dark-mode' : ''}`}>
            <div className="header-with-center">
              <button onClick={goBack} className="back-btn">🔙</button>
              <h2 className="header-title-center">레슨 선택</h2>
              <div className="header-spacer"></div>
            </div>
            <div className="lesson-selection">
              {lessons.map((lesson: any, index: number) => (
                <button
                  key={index}
                  ref={(el) => {
                    if (el) {
                      lessonRefs.current[lesson.lesson] = el;
                      // console.log('📌 Ref set for lesson:', lesson.lesson);
                    }
                  }}
                  onClick={() => selectLesson(lesson.lesson)}
                  className={`lesson-btn ${String(lesson.lesson) === String(selectedLessonId) ? 'selected' : ''}`}
                >
                  <div className="lesson-btn-content">

                    <span className="lesson-category">{lesson.category}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      }
    }

    // Content display
    if (selectedLesson) {
      return (
        <div className={`app full-height ${isDarkMode ? 'dark-mode' : ''}`}>
          <div className="header-with-center">
            <button onClick={goBack} className="back-btn">🔙</button>
            <h2 className="header-title-center">
              <span>{selectedLesson?.[0]?.lesson ? `${(selectedLesson[0] as any)?.content?.[0]?.category}` : selectedType}</span>
            </h2>
            <div className="header-spacer"></div>
          </div>

          {/* Content area - 90% */}
          <div className="content-area">
            {allSentences.length > 0 && (
              <div className="single-sentence-view">
                <div className="sentence-header">
                  <span className="sentence-id">ID: {allSentences[currentSentenceIndex]?.id}</span>
                  <div className="audio-controller">
                    <button
                      className="repeat-btn"
                      onClick={() => {
                        const counts = [1, 2, 3, 5, 10];
                        const currentIndex = counts.indexOf(repeatCount);
                        const nextIndex = (currentIndex + 1) % counts.length;
                        setRepeatCount(counts[nextIndex]);
                      }}
                    >
                      {repeatCount}회 반복
                    </button>
                  </div>
                  <div className="autoplay-controller">
                    <button
                      className={`autoplay-toggle-btn ${isAutoPlay ? 'active' : ''}`}
                      onClick={() => {
                        console.log(isAutoPlay ? '🛑 Switching to manual mode' : '▶️ Switching to auto mode');
                        setIsAutoPlay(!isAutoPlay);
                      }}
                      title={isAutoPlay ? '자동 모드 (클릭하면 수동 모드로 전환)' : '수동 모드 (클릭하면 자동 모드로 전환)'}
                    >
                      {isAutoPlay ? '자동' : '수동'}
                    </button>
                  </div>
                  <span className="sentence-counter">{currentSentenceIndex + 1} / {allSentences.length}</span>
                </div>

                <div className="sentence-content">
                  {displayMode === 'chinese' && (
                    <div className="chinese-display">
                      <div className="chinese-display-scroll">
                        {showTranslations && (
                          <div
                            className="sentence-translations"
                            onTouchStart={onTouchStart}
                            onTouchMove={onTouchMove}
                            onTouchEnd={onTouchEnd}
                          >
                            {allSentences[currentSentenceIndex]?.sentence && (
                              <p
                                className="translation-sentence"
                                onClick={() => playManual(allSentences[currentSentenceIndex]?.sentence, 'chinese', repeatCount)}
                              >
                                {allSentences[currentSentenceIndex]?.sentence}
                              </p>
                            )}
                            {allSentences[currentSentenceIndex]?.english && (
                              <p
                                className="translation-english"
                                onClick={() => playManual(allSentences[currentSentenceIndex]?.english, 'english', repeatCount)}
                              >
                                {allSentences[currentSentenceIndex]?.english}
                              </p>
                            )}
                            {allSentences[currentSentenceIndex]?.korean && (
                              <p
                                className="translation-korean"
                                onClick={() => playManual(allSentences[currentSentenceIndex]?.korean, 'korean', repeatCount)}
                              >
                                {allSentences[currentSentenceIndex]?.korean}
                              </p>
                            )}

                            {allSentences[currentSentenceIndex]?.pinyin && (
                              <p
                                className="translation-pinyin"
                                onClick={() => playManual(allSentences[currentSentenceIndex]?.sentence, 'chinese', repeatCount)}
                              >
                                {allSentences[currentSentenceIndex]?.pinyin}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="words-sentence-separator">
                        <p className="main-sentence" onClick={() => setShowTranslations(!showTranslations)}>
                          {allSentences[currentSentenceIndex]?.sentence}
                        </p>
                      </div>
                    </div>
                  )}

                  {displayMode === 'translations' && (
                    <div className="translations-display">
                      <div className="translations-display-scroll">
                        <div className="translation-item">
                          <span className="content">{allSentences[currentSentenceIndex]?.sentence}</span>
                          <button
                            className="tts-button-inline"
                            onClick={() => playManual(allSentences[currentSentenceIndex]?.sentence, 'chinese', repeatCount)}
                            title="중국어 음성 재생"
                          >
                            🔊
                          </button>
                        </div>
                        <div className="translation-item">
                          <span className="content">{allSentences[currentSentenceIndex]?.pinyin}</span>
                        </div>
                        <div className="translation-item">
                          <span className="content">{allSentences[currentSentenceIndex]?.korean}</span>
                          <button
                            className="tts-button-inline"
                            onClick={() => playManual(allSentences[currentSentenceIndex]?.korean, 'korean', repeatCount)}
                            title="한국어 음성 재생"
                          >
                            🔊
                          </button>
                        </div>
                      </div>

                      <div className="words-sentence-separator">
                        <p className="main-sentence" onClick={() => setShowTranslations(!showTranslations)}>
                          {allSentences[currentSentenceIndex]?.sentence}
                        </p>
                      </div>
                    </div>


                  )}

                  {displayMode === 'others' && (
                    <div className="translations-display" key={`others-${currentSentenceIndex}`}>
                      <div className="translations-display-scroll">
                        <div className="translation-item">
                          <span className="content">{allSentences[currentSentenceIndex]?.english}</span>
                          <button
                            className="tts-button-inline"
                            onClick={() => playManual(allSentences[currentSentenceIndex]?.english, 'english', repeatCount)}
                            title="영어 음성 재생"
                          >
                            🔊
                          </button>
                        </div>
                        <div className="translation-item">
                          <span className="content">{allSentences[currentSentenceIndex]?.japanese}</span>
                          <button
                            className="tts-button-inline"
                            onClick={() => playManual(allSentences[currentSentenceIndex]?.japanese, 'japanese', repeatCount)}
                            title="일본어 음성 재생"
                          >
                            🔊
                          </button>
                        </div>
                        <div className="translation-item">
                          <span className="content">{allSentences[currentSentenceIndex]?.japanese_romaji}</span>
                        </div>
                      </div>

                      <div className="words-sentence-separator">
                        <p className="main-sentence" onClick={() => setShowTranslations(!showTranslations)}>
                          {allSentences[currentSentenceIndex]?.sentence}
                        </p>
                      </div>
                    </div>
                  )}

                  {displayMode === 'words' && (
                    <div className="words-display-container">
                      <div className="words-display-scroll">
                        {allSentences[currentSentenceIndex]?.words && allSentences[currentSentenceIndex].words.words ?
                          allSentences[currentSentenceIndex].words.words.map((word: any, wIndex: number) => (
                            <div key={wIndex} className="word-item-detail">
                              <div className="word-row-main">
                                <div className="word-chinese">
                                  {word}
                                  <button
                                    className="tts-button-word"
                                    onClick={() => playManual(word, 'chinese', repeatCount)}
                                    title="단어 음성 재생"
                                  >
                                    🔊
                                  </button>
                                </div>
                                <div className="word-pinyin">{allSentences[currentSentenceIndex].words.pinyin?.[wIndex]}</div>
                                <div className="word-korean">{allSentences[currentSentenceIndex].words.korean?.[wIndex]}</div>
                              </div>
                              <div className="word-row-sub">
                                <div className="word-traditional">{allSentences[currentSentenceIndex].words.traditional?.[wIndex]}</div>
                                <div className="word-meaning">{allSentences[currentSentenceIndex].words.meaning_and_reading?.[wIndex]}</div>
                              </div>
                            </div>
                          )) : (
                            <div className="no-words">이 문장에는 단어 정보가 없습니다.</div>
                          )
                        }
                      </div>

                      <div className="words-sentence-separator">
                        <p className="main-sentence" onClick={() => setShowTranslations(!showTranslations)}>
                          {allSentences[currentSentenceIndex]?.sentence}
                        </p>
                      </div>
                    </div>
                  )}
                </div>


              </div>
            )}
          </div>

          {/* Control buttons - 10% */}
          <div className="control-buttons">
            {/* Sentence controls moved outside content area */}
            <button
              onClick={() => setDisplayMode('others')}
              className={`control-btn mode-btn ${displayMode === 'others' ? 'active' : ''}`}
            >
              🌐
            </button>
            <button
              onClick={() => setDisplayMode('words')}
              className={`control-btn mode-btn ${displayMode === 'words' ? 'active' : ''}`}
            >
              🔤
            </button>
            <button
              onClick={() => setDisplayMode('chinese')}
              className={`control-btn mode-btn ${displayMode === 'chinese' ? 'active' : ''}`}
            >
              中
            </button>
            <button
              onClick={() => navigateManual('prev')}
              className="control-btn prev-btn"
            >
              ◀️
            </button>
            <button
              onClick={() => navigateManual('next')}
              className="control-btn next-btn"
            >
              ▶️
            </button>
          </div>

          {/* 레슨 이동 확인 모달 */}
          {showLessonModal && (
            <div className="lesson-modal-overlay">
              <div className="lesson-modal">
                <h3>{nextLessonDirection === 'next' ? '다음 레슨을 불러올까요?' : '이전 레슨을 불러올까요?'}</h3>
                <div className="lesson-modal-buttons">
                  <button
                    className="lesson-modal-btn confirm"
                    onClick={() => {
                      if (targetLessonNum !== null) {
                        selectLesson(String(targetLessonNum));
                        // 이전 레슨으로 이동하는 경우 마지막 문장으로 이동
                        if (nextLessonDirection === 'prev') {
                          // selectLesson이 완료된 후 마지막 문장으로 이동하도록 타이머 설정
                          setTimeout(() => {
                            const prevLessonContent = lessonData.contents.filter((item: any) => {
                              return String(item.lesson) === String(targetLessonNum) || item.lesson === targetLessonNum;
                            });
                            const prevSentences: any[] = [];
                            prevLessonContent.forEach((lessonItem: any) => {
                              if (lessonItem.content) {
                                lessonItem.content.forEach((categoryItem: any) => {
                                  if (categoryItem.subcategories) {
                                    categoryItem.subcategories.forEach((subcat: any) => {
                                      if (subcat.sentences) {
                                        prevSentences.push(...subcat.sentences);
                                      }
                                    });
                                  }
                                });
                              }
                            });
                            if (prevSentences.length > 0) {
                              setCurrentSentenceIndex(prevSentences.length - 1);
                            }
                          }, 100);
                        }
                      }
                      setShowLessonModal(false);
                      setNextLessonDirection(null);
                      setTargetLessonNum(null);
                    }}
                  >
                    확인
                  </button>
                  <button
                    className="lesson-modal-btn cancel"
                    onClick={() => {
                      setShowLessonModal(false);
                      setNextLessonDirection(null);
                      setTargetLessonNum(null);
                    }}
                  >
                    취소
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      );
    }
  }

  return <div>Loading...</div>;
}

export default App;