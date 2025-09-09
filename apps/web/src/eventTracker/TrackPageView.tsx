'use client';

import { useEffect } from 'react';

import { trackAmplitudePageView } from '@workspace/amplitude/trackAmplitudePageView';

/**
 * 페이지 뷰 추적 (URL 경로 기반)
 * - Amplitude 페이지 뷰 추적
 * @todo GA 페이지 뷰 추적 추가
 */
export const TrackPageView = () => {
  useEffect(() => {
    trackAmplitudePageView();
  }, []);

  return null;
};
