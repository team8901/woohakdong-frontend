import { type ClubApplicationSubmissionResponseApplicationStatus } from '@workspace/api/generated';

export const SUBMISSION_STATUS_LABELS: Record<
  ClubApplicationSubmissionResponseApplicationStatus,
  string
> = {
  PENDING: '대기중',
  APPROVED: '승인됨',
  REJECTED: '거절됨',
  WITHDRAWN: '철회됨',
};

export const SUBMISSION_STATUS_VARIANTS: Record<
  ClubApplicationSubmissionResponseApplicationStatus,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  PENDING: 'secondary',
  APPROVED: 'default',
  REJECTED: 'destructive',
  WITHDRAWN: 'outline',
};
