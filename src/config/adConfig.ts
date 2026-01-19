// 광고 포인트 ID 정의
export type AdPointId =
  | 'CATEGORY_SELECT'      // 카테고리 선택 시
  | 'LESSON_SELECT'        // 레슨 선택 시
  | 'LESSON_COMPLETE'      // 레슨 완료 시
  | 'STUDY_START'          // 학습 시작 시
  | 'NAVIGATION_CHANGE';   // 네비게이션 변경 시

// 광고 포인트 설정 타입
export interface AdPointConfig {
  id: AdPointId;
  name: string;           // 한글 이름
  description: string;    // 설명
  enabled: boolean;       // 활성화 여부
  type: 'interstitial' | 'banner'; // 광고 유형
  probability: number;    // 표시 확률 (0-1)
  countThreshold?: number; // 횟수 임계값 (이 횟수마다 광고 표시)
}

// 기본 광고 포인트 설정
export const defaultAdPoints: Record<AdPointId, AdPointConfig> = {
  CATEGORY_SELECT: {
    id: 'CATEGORY_SELECT',
    name: '카테고리 선택',
    description: '카테고리 선택 시 광고 표시',
    enabled: false,
    type: 'interstitial',
    probability: 0.5,
    countThreshold: 5,
  },
  LESSON_SELECT: {
    id: 'LESSON_SELECT',
    name: '레슨 선택',
    description: '레슨 선택 시 광고 표시',
    enabled: false,
    type: 'interstitial',
    probability: 0.5,
    countThreshold: 5,
  },
  LESSON_COMPLETE: {
    id: 'LESSON_COMPLETE',
    name: '레슨 완료',
    description: '레슨 완료 시 광고 표시',
    enabled: true,
    type: 'interstitial',
    probability: 0.5,
  },
  STUDY_START: {
    id: 'STUDY_START',
    name: '학습 시작',
    description: '학습 시작 시 광고 표시',
    enabled: false,
    type: 'interstitial',
    probability: 0.3,
  },
  NAVIGATION_CHANGE: {
    id: 'NAVIGATION_CHANGE',
    name: '네비게이션 변경',
    description: '하단 네비게이션 변경 시 광고 표시',
    enabled: true,
    type: 'interstitial',
    probability: 0.5,
    countThreshold: 5,
  },
};

// 로컬 스토리지 키
export const AD_CONFIG_STORAGE_KEY = 'chineseApp_adConfig';

// 설정 저장
export const saveAdConfig = (config: Record<AdPointId, AdPointConfig>): void => {
  try {
    localStorage.setItem(AD_CONFIG_STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save ad config:', e);
  }
};

// 설정 불러오기
export const loadAdConfig = (): Record<AdPointId, AdPointConfig> => {
  try {
    const saved = localStorage.getItem(AD_CONFIG_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // 기본값과 병합 (새로운 광고 포인트가 추가된 경우 대비)
      return { ...defaultAdPoints, ...parsed };
    }
  } catch (e) {
    console.error('Failed to load ad config:', e);
  }
  return defaultAdPoints;
};
