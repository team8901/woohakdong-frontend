// 휴대폰 번호 정규식 (대시 포함)
export const PHONE_NUMBER_REGEX = /^01([0|1|6|7|8|9])-([0-9]{3,4})-([0-9]{4})$/;

// 학번 정규식 (숫자만, 9-11자리)
export const STUDENT_ID_REGEX = /^[0-9]{9,11}$/;

// 닉네임 정규식 (한글, 영문, 숫자, 일부 특수문자 허용)
export const NICKNAME_REGEX = /^[가-힣a-zA-Z0-9]+$/;

// 성별 옵션 상수
export const GENDER_OPTIONS = [
  { value: 'MALE', label: '남성' },
  { value: 'FEMALE', label: '여성' },
] as const;
