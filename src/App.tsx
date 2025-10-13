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
  const REPEAT_PAUSE_TIME = 1500; // 반복 사이 휴지시간 (1.5초)
  const LESSON_PAUSE_TIME = REPEAT_PAUSE_TIME * 2; // 레슨 경계 휴지시간 (3초)


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

  // 자동 모드에서 수동 모드로 전환 시 오디오 중지
  useEffect(() => {
    if (!isAutoPlay) {
      // 자동 재생 취소 플래그 설정
      autoPlayCancelledRef.current = true;
      // 오디오 중지
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }
  }, [isAutoPlay]);

  // 자동 모드에서 레슨이 변경되면 첫 문장 자동 재생
  useEffect(() => {
    if (isAutoPlay && selectedLessonId && previousLessonIdRef.current !== selectedLessonId) {
      // 레슨이 변경되었고, 자동 재생이 이미 시작된 상태라면
      if (previousLessonIdRef.current !== null && allSentences.length > 0 && allSentences[0]?.sentence) {
        // 새 레슨의 첫 문장 자동 재생
        const timer = setTimeout(() => {
          // 취소 확인
          if (autoPlayCancelledRef.current) {
            autoPlayCancelledRef.current = false;
            return;
          }

          if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();

            const playFirstSentence = async () => {
              // 취소 확인
              if (autoPlayCancelledRef.current) {
                autoPlayCancelledRef.current = false;
                return;
              }

              const utterance = new SpeechSynthesisUtterance(allSentences[0].sentence);
              utterance.lang = 'zh-CN';
              utterance.rate = 0.9;

              const playOnce = () => {
                return new Promise<void>((resolve) => {
                  utterance.onend = () => resolve();
                  utterance.onerror = () => resolve();
                  window.speechSynthesis.speak(utterance);
                });
              };

              // 반복 재생
              for (let i = 0; i < repeatCount; i++) {
                // 취소 확인
                if (autoPlayCancelledRef.current) {
                  autoPlayCancelledRef.current = false;
                  return;
                }

                await playOnce();

                // 취소 확인
                if (autoPlayCancelledRef.current) {
                  autoPlayCancelledRef.current = false;
                  return;
                }

                if (i < repeatCount - 1) {
                  await new Promise(resolve => setTimeout(resolve, REPEAT_PAUSE_TIME));
                }
              }

              // 취소 확인
              if (autoPlayCancelledRef.current) {
                autoPlayCancelledRef.current = false;
                return;
              }

              // 다음 문장으로 자동 이동
              if (allSentences.length > 1) {
                await new Promise(resolve => setTimeout(resolve, REPEAT_PAUSE_TIME));

                // 취소 확인
                if (autoPlayCancelledRef.current) {
                  autoPlayCancelledRef.current = false;
                  return;
                }

                setCurrentSentenceIndex(1);
                if (allSentences[1]?.sentence) {
                  playAudio(allSentences[1].sentence, 'chinese', repeatCount, true, 1);
                }
              }
            };

            playFirstSentence();
          }
        }, 100);

        return () => clearTimeout(timer);
      }
      previousLessonIdRef.current = selectedLessonId;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLessonId, isAutoPlay, allSentences, repeatCount, REPEAT_PAUSE_TIME]);

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
      // 위로 스와이프 - 다음 문장
      if (currentSentenceIndex < allSentences.length - 1) {
        setCurrentSentenceIndex(currentSentenceIndex + 1);
      } else {
        // 마지막 문장에서 다음 레슨으로
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
      }
    }

    if (isDownSwipe) {
      // 아래로 스와이프 - 이전 문장
      if (currentSentenceIndex > 0) {
        setCurrentSentenceIndex(currentSentenceIndex - 1);
      } else {
        // 첫 문장에서 이전 레슨으로
        const currentLessonNum = parseInt(selectedLessonId || '0');
        const prevLessonNum = currentLessonNum - 1;

        if (prevLessonNum >= 1) {
          setTargetLessonNum(prevLessonNum);
          setNextLessonDirection('prev');
          setShowLessonModal(true);
        }
      }
    }
  };

  const playAudio = async (text: string, lang?: string, repeat: number = 1, autoPlayNext: boolean = false, nextIndex?: number) => {
    try {
      if ('speechSynthesis' in window) {
        // 이전 재생 중지
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

        // 반복 재생
        for (let i = 0; i < repeat; i++) {
          // 취소 확인
          if (autoPlayCancelledRef.current) {
            autoPlayCancelledRef.current = false;
            return;
          }

          await playOnce();

          // 취소 확인
          if (autoPlayCancelledRef.current) {
            autoPlayCancelledRef.current = false;
            return;
          }

          // 반복 사이에 휴지시간
          if (i < repeat - 1) {
            await new Promise(resolve => setTimeout(resolve, REPEAT_PAUSE_TIME));
          }
        }

        // 자동 재생 모드일 때 다음 문장으로 이동
        if (autoPlayNext) {
          // 취소 확인
          if (autoPlayCancelledRef.current) {
            autoPlayCancelledRef.current = false;
            return;
          }

          const currentIdx = nextIndex !== undefined ? nextIndex : currentSentenceIndex;
          if (currentIdx < allSentences.length - 1) {
            await new Promise(resolve => setTimeout(resolve, REPEAT_PAUSE_TIME));

            // 취소 확인
            if (autoPlayCancelledRef.current) {
              autoPlayCancelledRef.current = false;
              return;
            }

            const nextIdx = currentIdx + 1;
            setCurrentSentenceIndex(nextIdx);
            // 다음 문장 자동 재생
            if (allSentences[nextIdx]?.sentence) {
              playAudio(allSentences[nextIdx].sentence, 'chinese', repeat, true, nextIdx);
            }
          } else {
            // 마지막 문장에서 자동으로 다음 레슨으로 이동 (레슨 경계 휴지시간 적용)
            const currentLessonNum = parseInt(selectedLessonId || '0');
            const nextLessonNum = currentLessonNum + 1;

            if (lessonData && lessonData.contents) {
              const nextLessonExists = lessonData.contents.some(
                (item: any) => String(item.lesson) === String(nextLessonNum) || item.lesson === nextLessonNum
              );

              if (nextLessonExists) {
                await new Promise(resolve => setTimeout(resolve, LESSON_PAUSE_TIME));

                // 취소 확인
                if (autoPlayCancelledRef.current) {
                  autoPlayCancelledRef.current = false;
                  return;
                }

                // 자동 모드에서는 바로 다음 레슨으로 이동
                selectLesson(String(nextLessonNum));
                // 다음 레슨의 첫 문장 자동 재생은 selectLesson이 완료된 후 시작됨
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Audio playback error:', error);
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
                        const counts = [1, 3, 5, 10];
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
                      onClick={() => setIsAutoPlay(!isAutoPlay)}
                      title={isAutoPlay ? '자동 모드' : '수동 모드'}
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
                                onClick={() => playAudio(allSentences[currentSentenceIndex]?.sentence, 'chinese', repeatCount, isAutoPlay)}
                              >
                                {allSentences[currentSentenceIndex]?.sentence}
                              </p>
                            )}
                            {allSentences[currentSentenceIndex]?.english && (
                              <p
                                className="translation-english"
                                onClick={() => playAudio(allSentences[currentSentenceIndex]?.english, 'english', repeatCount, isAutoPlay)}
                              >
                                {allSentences[currentSentenceIndex]?.english}
                              </p>
                            )}
                            {allSentences[currentSentenceIndex]?.korean && (
                              <p
                                className="translation-korean"
                                onClick={() => playAudio(allSentences[currentSentenceIndex]?.korean, 'korean', repeatCount, isAutoPlay)}
                              >
                                {allSentences[currentSentenceIndex]?.korean}
                              </p>
                            )}

                            {allSentences[currentSentenceIndex]?.pinyin && (
                              <p
                                className="translation-pinyin"
                                onClick={() => playAudio(allSentences[currentSentenceIndex]?.sentence, 'chinese', repeatCount, isAutoPlay)}
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
                            onClick={() => playAudio(allSentences[currentSentenceIndex]?.sentence, 'chinese')}
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
                            onClick={() => playAudio(allSentences[currentSentenceIndex]?.korean, 'korean')}
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
                            onClick={() => playAudio(allSentences[currentSentenceIndex]?.english, 'english')}
                            title="영어 음성 재생"
                          >
                            🔊
                          </button>
                        </div>
                        <div className="translation-item">
                          <span className="content">{allSentences[currentSentenceIndex]?.japanese}</span>
                          <button
                            className="tts-button-inline"
                            onClick={() => playAudio(allSentences[currentSentenceIndex]?.japanese, 'japanese')}
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
                                    onClick={() => playAudio(word, 'chinese')}
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
              onClick={() => {
                if (currentSentenceIndex === 0) {
                  // 첫 문장에서 이전 레슨으로 이동
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
              }}
              className="control-btn prev-btn"
            >
              ◀️
            </button>
            <button
              onClick={() => {
                if (currentSentenceIndex >= allSentences.length - 1) {
                  // 마지막 문장에서 다음 레슨으로 이동
                  const currentLessonNum = parseInt(selectedLessonId || '0');
                  const nextLessonNum = currentLessonNum + 1;

                  // lessonData에서 다음 레슨이 존재하는지 확인
                  if (lessonData && lessonData.contents) {
                    const nextLessonExists = lessonData.contents.some(
                      (item: any) => String(item.lesson) === String(nextLessonNum) || item.lesson === nextLessonNum
                    );

                    if (nextLessonExists) {
                      // 수동 모드일 때만 팝업 표시
                      if (!isAutoPlay) {
                        setTargetLessonNum(nextLessonNum);
                        setNextLessonDirection('next');
                        setShowLessonModal(true);
                      } else {
                        // 자동 모드일 때는 바로 이동
                        selectLesson(String(nextLessonNum));
                      }
                    }
                  }
                } else {
                  setCurrentSentenceIndex(currentSentenceIndex + 1);
                }
              }}
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