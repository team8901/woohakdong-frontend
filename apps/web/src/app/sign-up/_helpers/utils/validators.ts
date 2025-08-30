import {
  NICKNAME_REGEX,
  PHONE_NUMBER_REGEX,
  STUDENT_ID_REGEX,
} from '../constants';

export const validatePhoneNumber = (phoneNumber: string): boolean => {
  return PHONE_NUMBER_REGEX.test(phoneNumber);
};

export const validateStudentId = (studentId: string): boolean => {
  return STUDENT_ID_REGEX.test(studentId);
};

export const validateNickname = (nickname: string): boolean => {
  return (
    NICKNAME_REGEX.test(nickname) &&
    nickname.length >= 2 &&
    nickname.length <= 20
  );
};
