import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useGlobalState, IntegratedType, CurrentlyType, DataCategory } from '../../contexts/GlobalStateContext';
import { useLessonData } from '../../hooks';
import { Header } from '../common';
import CategorySelector from './CategorySelector';
import TypeSelector from './TypeSelector';
import LessonSelector from './LessonSelector';
import StudyView from './StudyView';

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
    selectLesson(lessonId);
  };

  // 뒤로가기
  const handleBack = () => {
    if (state.selectedLessonId && allSentences.length > 0) {
      // 학습 중 -> 레슨 선택
      updateState('selectedLessonId', null);
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
    // 학습 뷰 (레슨 선택 + 문장 있음)
    if (state.selectedLessonId && allSentences.length > 0) {
      return <StudyView />;
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
