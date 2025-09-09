import { amplitude } from './amplitude';

export const initAmplitude = () => {
  const apiKey = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY;

  if (!apiKey) {
    console.warn('Amplitude API key is not set.');
    return;
  }

  amplitude.init(apiKey, undefined, {
    defaultTracking: {
      /**
       * 기본 페이지 뷰 이벤트 비활성화
       * - 대신 커스텀 페이지 뷰 추적 사용 (trackAmplitudePageView)
       */
      pageViews: false,
    },
  });
};
