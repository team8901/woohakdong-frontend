import { DASHBOARD_HEADER_MAP as DASHBOARD_HEADER_PATH_MAP } from '../constants';
import { type PathData } from '../types';

export const getPathData = (pathname: string): PathData => {
  return (
    DASHBOARD_HEADER_PATH_MAP[pathname] || {
      category: '대시보드',
      title: '홈',
    }
  );
};
