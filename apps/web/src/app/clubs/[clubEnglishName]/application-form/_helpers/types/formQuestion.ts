import { type FormQuestionType } from '@workspace/api/generated';

export type FormQuestion = {
  id: string;
  order: number;
  question: string;
  type: FormQuestionType;
  required: boolean;
  options: string[];
};

let questionIdCounter = 0;

export const createEmptyQuestion = (order: number): FormQuestion => ({
  id: `question-${Date.now()}-${++questionIdCounter}`,
  order,
  question: '',
  type: 'TEXT',
  required: false,
  options: [],
});
