import { DASHBOARD_HEADER_MAP } from '../constants';
import { type DashboardHeaderData } from '../types';

export const getDashboardHeaderData = (
  pathname: string,
): DashboardHeaderData => {
  return (
    DASHBOARD_HEADER_MAP[pathname] || {
      category: '대시보드',
      title: '홈',
    }
  );
};
