export const APP_PATH = {
  HOME: '/',
  LOGIN: '/login',
  SIGN_UP: '/sign-up',
  CLUB_LIST: '/club-list',
  REGISTER_CLUB: {
    HOME: '/register-club',
    SUCCESS: '/register-club/success',
  },
  /** 동아리 전용 페이지 */
  CLUBS: {
    HOME: '/clubs/:clubEnglishName',
  },
  // TODO: 동아리 전용 페이지 안에 대시보드 넣기
  DASHBOARD: {
    NOTICE: '/notice',
    ACTIVITY: '/activity',
    SCHEDULE: '/schedule',
    MEMBER: '/member',
    ITEM: '/item',
    ITEM_HISTORY: '/item-history',
    CLUB_INFO: '/club-info',
  },
};
