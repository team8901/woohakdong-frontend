// 이메일 정규식
export const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

// 대학명 정규식
export const SCHOOL_NAME_REGEX = /^[0-9가-힣\s]{2,}$/;

// 클럽 카테고리 옵션
export const CLUB_CATEGORY_OPTIONS = [
  '친목',
  '봉사',
  '운동',
  '여행',
  '음악',
  '게임',
  '예술',
  '공예',
  '언어',
  '미디어',
  '학술',
  '반려동물',
  '종교',
  '기타',
] as const;
