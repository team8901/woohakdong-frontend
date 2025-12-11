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
    NOTICE: '/clubs/:clubEnglishName/notice',
    NOTICE_DETAIL: '/clubs/:clubEnglishName/notice/:noticeId',
    NOTICE_EDIT: '/clubs/:clubEnglishName/notice/:noticeId/edit',
    ACTIVITY: '/clubs/:clubEnglishName/activity',
    ACTIVITY_DETAIL: '/clubs/:clubEnglishName/activity/:activityId',
    SCHEDULE: '/clubs/:clubEnglishName/schedule',
    MEMBER: '/clubs/:clubEnglishName/member',
    ITEM: '/clubs/:clubEnglishName/item',
    ITEM_HISTORY: '/clubs/:clubEnglishName/item-history',
    CLUB_INFO: '/clubs/:clubEnglishName/club-info',
    APPLICATION_FORM: '/clubs/:clubEnglishName/application-form',
  },
  /** 동아리 가입 신청 (비회원 접근 가능) */
  JOIN: '/join/:clubEnglishName/:formId',
};
