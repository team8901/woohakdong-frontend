import {
  NICKNAME_REGEX,
  PHONE_NUMBER_REGEX,
  STUDENT_ID_REGEX,
} from '../constants/regex';

export const validatePhoneNumber = (phoneNumber: string): boolean => {
  return PHONE_NUMBER_REGEX.test(phoneNumber);
};

export const validateStudentId = (studentId: string): boolean => {
  return STUDENT_ID_REGEX.test(studentId);
};

export const validateMajor = (major: string): boolean => {
  return major.length >= 1 && major.length <= 50;
};

export const validateNickname = (nickname: string): boolean => {
  return (
    NICKNAME_REGEX.test(nickname) &&
    nickname.length >= 2 &&
    nickname.length <= 20
  );
};
