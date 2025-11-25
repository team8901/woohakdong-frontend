export const API_URL = {
  AUTH: {
    SOCIAL_LOGIN: '/api/auth/social-login',
    TOKEN_REFRESH: '/api/auth/refresh',
    TEST: '/api/auth/test',
  },
  CLUB: {
    CLUB_INFO_SEARCH: '/api/clubs/search',
    REGISTER_CLUB: '/api/clubs',
    GET_JOINED_CLUBS: '/api/clubs',
    UPDATE_CLUB_INFO: '/api/clubs/:clubId',
    CLUB_MEMBERS: '/api/clubs/:clubId/members',
    CLUB_ITEMS: '/api/clubs/:clubId/items',
    CLUB_ITEM_HISTORY: '/api/clubs/:clubId/items/history',
  },
  USER: {
    MY_PROFILE: '/api/users/profiles/me',
    REGISTER_PROFILE: '/api/users/profiles',
  },
  UTIL: {
    PRESIGNED_URL: '/utils/images/presigned-url',
  },
} as const;
