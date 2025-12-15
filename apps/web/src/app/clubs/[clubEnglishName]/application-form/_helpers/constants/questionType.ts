import { type FormQuestionType } from '@workspace/api/generated';

export const QUESTION_TYPE_LABELS: Record<FormQuestionType, string> = {
  TEXT: '텍스트',
  RADIO: '단일 선택',
  CHECKBOX: '복수 선택',
  SELECT: '드롭다운',
};

export const needsOptions = (type: FormQuestionType) =>
  type === 'RADIO' || type === 'CHECKBOX' || type === 'SELECT';
