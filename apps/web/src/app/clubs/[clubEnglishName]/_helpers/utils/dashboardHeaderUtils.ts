import { DASHBOARD_BREADCRUMB_MAP as DASHBOARD_HEADER_PATH_MAP } from '../constants';
import { type PathData } from '../types';

/**
 * pathname에서 clubEnglishName 이후의 경로를 추출하여 breadcrumb 데이터 반환
 * 예: /clubs/myclub/notice -> /notice
 */
export const getPathData = (pathname: string): PathData => {
  // /clubs/[clubEnglishName]/xxx 형태에서 xxx 부분 추출
  const match = pathname.match(/^\/clubs\/[^/]+(\/.+)?$/);
  const subPath = match?.[1] ?? '';

  return (
    DASHBOARD_HEADER_PATH_MAP[subPath] || {
      category: '대시보드',
      title: '홈',
    }
  );
};
