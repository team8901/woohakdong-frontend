import { EMAIL_REGEX, SCHOOL_NAME_REGEX } from '../constants/regex';

export const validateEmail = (email: string): boolean => {
  return EMAIL_REGEX.test(email);
};

export const validateSchoolName = (schoolName: string): boolean => {
  return SCHOOL_NAME_REGEX.test(schoolName);
};
