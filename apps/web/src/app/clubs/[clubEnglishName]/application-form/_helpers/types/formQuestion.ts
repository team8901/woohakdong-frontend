import { type FormQuestionType } from '@workspace/api/generated';

export type FormQuestion = {
  order: number;
  question: string;
  type: FormQuestionType;
  required: boolean;
  options: string[];
};

export const createEmptyQuestion = (order: number): FormQuestion => ({
  order,
  question: '',
  type: 'TEXT',
  required: false,
  options: [],
});
