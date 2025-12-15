export const API_URL = {
  AUTH: {
    SOCIAL_LOGIN: '/api/auth/social-login',
    TOKEN_REFRESH: '/api/auth/refresh',
    TEST: '/api/auth/test',
  },
  CLUB: {
    CLUB_NOTICES: '/api/clubs/:clubId/notices',
    CLUB_NOTICES_DETAIL: '/api/clubs/:clubId/notices/:noticeId',
    CLUB_INFO_SEARCH: '/api/clubs/search',
    REGISTER_CLUB: '/api/clubs',
    GET_JOINED_CLUBS: '/api/clubs',
    UPDATE_CLUB_INFO: '/api/clubs/:clubId',
    CLUB_MEMBERS: '/api/clubs/:clubId/members',
    CLUB_ITEMS: '/api/clubs/:clubId/items',
    CLUB_ITEM_DETAIL: '/api/clubs/:clubId/items/:itemId',
    CLUB_ITEM_RENT: '/api/clubs/:clubId/items/:itemId/rent',
    CLUB_ITEM_RETURN: '/api/clubs/:clubId/items/:itemId/return',
    CLUB_ITEM_HISTORY: '/api/clubs/:clubId/items/history',
    APPLICATION_FORMS: '/api/clubs/:clubId/application-forms',
    APPLICATION_FORM_LATEST: '/api/clubs/:clubId/application-forms/latest',
    APPLICATION_SUBMISSIONS:
      '/api/clubs/:clubId/application-forms/:applicationFormId/submissions',
  },
  USER: {
    MY_PROFILE: '/api/users/profiles/me',
    REGISTER_PROFILE: '/api/users/profiles',
  },
  UTIL: {
    PRESIGNED_URL: '/utils/images/presigned-url',
  },
  COOKIE: {
    USER_ROLE: '/api/auth/roles',
    CLUB_MEMBER_ROLE: '/api/auth/club-roles',
  },
} as const;
