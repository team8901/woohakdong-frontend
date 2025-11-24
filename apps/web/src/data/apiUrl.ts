export const API_URL = {
  AUTH: {
    SOCIAL_LOGIN: '/api/auth/social-login',
    TOKEN_REFRESH: '/api/auth/refresh',
    TEST: '/api/auth/test',
  },
  CLUB: {
    CLUB_INFO_SEARCH: '/api/clubs/search',
    REGISTER_CLUB: '/api/clubs',
  },
  NOTICE: {
    COLLECTION: '/api/clubs/{clubId}/notices', // 목록 조회, 생성
    RESOURCE: '/api/clubs/{clubId}/notices/{noticeId}', // 상세 조회, 수정, 삭제
  },
  USER: {
    MY_PROFILE: '/api/users/profiles/me',
    REGISTER_PROFILE: '/api/users/profiles',
  },
  UTIL: {
    PRESIGNED_URL: '/utils/images/presigned-url',
  },
};
