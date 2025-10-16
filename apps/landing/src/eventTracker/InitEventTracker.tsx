'use client';

import { useEffect } from 'react';

import { initAmplitude } from '@workspace/amplitude/initAmplitude';

/**
 * 이벤트 추적 초기화
 * - Amplitude 초기화
 * @todo GA 초기화 추가
 */
export const InitEventTracker = () => {
  useEffect(() => {
    initAmplitude();
  }, []);

  return null;
};
