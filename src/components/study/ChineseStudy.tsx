import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useGlobalState, IntegratedType, CurrentlyType, DataCategory, PlayMode } from '../../contexts/GlobalStateContext';
import { useLessonData } from '../../hooks';
import { Header } from '../common';
import CategorySelector from './CategorySelector';
import TypeSelector from './TypeSelector';
import LessonSelector from './LessonSelector';
import PlaySelector from './PlaySelector';
import LessonPlaySettingsSelector from './LessonPlaySettingsSelector';
import StudyView from './StudyView';
import LessonStudyView from './LessonStudyView';

const ChineseStudy: React.FC = () => {
  const navigate = useNavigate();
  const { state, updateState } = useGlobalState();
  const {
    lessonData,
    lessons,
    loading,
    loadLessonData,
    selectLesson,
    allSentences
  } = useLessonData({
    selectedType: state.selectedType,
    selectedLessonId: state.selectedLessonId
  });

  // 저장된 타입이 있으면 데이터 로드
  useEffect(() => {
    if (state.selectedType && !lessonData) {
      loadLessonData(state.selectedType);
    }
  }, [state.selectedType, lessonData, loadLessonData]);

  // 저장된 레슨 ID가 있으면 레슨 선택
  useEffect(() => {
    if (lessonData && state.selectedLessonId) {
      selectLesson(state.selectedLessonId);
    }
  }, [lessonData, state.selectedLessonId, selectLesson]);

  // 카테고리 선택
  const handleSelectCategory = (category: DataCategory) => {
    updateState('dataCategory', category);
  };

  // 타입 선택
  const handleSelectType = async (type: IntegratedType | CurrentlyType) => {
    updateState('selectedType', type);
    await loadLessonData(type);
  };

  // 레슨 선택
  const handleSelectLesson = (lessonId: string) => {
    updateState('selectedLessonId', lessonId);
    updateState('currentSentenceIndex', 0);
    updateState('playMode', null); // 플레이 모드 선택 화면으로
    selectLesson(lessonId);
  };

  // 플레이 모드 선택
  const handleSelectPlayMode = (mode: PlayMode) => {
    updateState('playMode', mode);
  };

  // 레슨 연습 시작 (설정 화면에서)
  const handleStartLessonPlay = () => {
    updateState('playMode', 'lesson_playing' as PlayMode);
  };

  // 레슨 연습 바로 시작 (설정 화면 없이)
  const handleStartLessonDirect = () => {
    updateState('playMode', 'lesson_playing' as PlayMode);
  };

  // 뒤로가기
  const handleBack = () => {
    if (state.playMode === 'lesson_playing') {
      // 레슨 연습 중 -> 레슨 연습 설정
      updateState('playMode', 'lesson');
    } else if (state.playMode === 'sentence') {
      // 문장 연습 중 -> 플레이 모드 선택
      updateState('playMode', null);
    } else if (state.playMode === 'lesson') {
      // 레슨 연습 설정 -> 플레이 모드 선택
      updateState('playMode', null);
    } else if (state.selectedLessonId && allSentences.length > 0) {
      // 플레이 모드 선택 -> 레슨 선택
      updateState('selectedLessonId', null);
      updateState('playMode', null);
    } else if (state.selectedType) {
      // 레슨 선택 -> 타입 선택
      updateState('selectedType', null);
      updateState('selectedLessonId', null);
    } else if (state.dataCategory) {
      // 타입 선택 -> 카테고리 선택
      updateState('dataCategory', null);
    } else {
      // 홈으로
      navigate('/');
    }
  };

  // 현재 상태에 따른 화면 렌더링
  const renderContent = () => {
    // 레슨 연습 뷰 (레슨 연습 모드 + 재생 중)
    if (state.playMode === 'lesson_playing' && state.selectedLessonId && allSentences.length > 0) {
      return <LessonStudyView />;
    }

    // 레슨 연습 설정 (레슨 연습 모드 선택됨)
    if (state.playMode === 'lesson' && state.selectedLessonId && allSentences.length > 0) {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Header
            title="레슨 연습 설정"
            onBack={handleBack}
          />
          <LessonPlaySettingsSelector onStart={handleStartLessonPlay} />
        </div>
      );
    }

    // 문장 연습 뷰 (문장 연습 모드 선택됨)
    if (state.playMode === 'sentence' && state.selectedLessonId && allSentences.length > 0) {
      return <StudyView />;
    }

    // 플레이 모드 선택 (레슨 선택됨 + 문장 있음)
    if (state.selectedLessonId && allSentences.length > 0 && state.playMode === null) {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Header
            title="학습 방식"
            onBack={handleBack}
          />
          <PlaySelector onSelectMode={handleSelectPlayMode} onStartLessonDirect={handleStartLessonDirect} />
        </div>
      );
    }

    // 레슨 선택 (타입 선택됨 + 레슨 데이터 있음)
    if (state.selectedType && lessonData) {
      // 레슨이 하나만 있으면 자동 선택
      if (lessons.length === 1 && !state.selectedLessonId) {
        handleSelectLesson(String(lessons[0].lesson));
        return null;
      }

      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Header
            title="레슨 선택"
            subtitle={state.selectedType.replace(/_/g, ' ')}
            onBack={handleBack}
          />
          <LessonSelector
            lessons={lessons}
            selectedLessonId={state.selectedLessonId}
            onSelectLesson={handleSelectLesson}
            loading={loading}
          />
        </div>
      );
    }

    // 타입 선택 (카테고리 선택됨)
    if (state.dataCategory) {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Header
            title={state.dataCategory === 'integrated' ? 'Integrated' : 'Currently'}
            onBack={handleBack}
          />
          <TypeSelector
            dataCategory={state.dataCategory}
            onSelectType={handleSelectType}
          />
        </div>
      );
    }

    // 카테고리 선택 (초기 상태)
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header title="중국어 학습" onBack={() => navigate('/')} />
        <CategorySelector onSelectCategory={handleSelectCategory} />
      </div>
    );
  };

  return (
    <AnimatePresence mode="wait">
      {renderContent()}
    </AnimatePresence>
  );
};

export default ChineseStudy;
