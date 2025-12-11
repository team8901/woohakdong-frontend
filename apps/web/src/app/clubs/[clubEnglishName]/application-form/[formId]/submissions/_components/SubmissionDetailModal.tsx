import { type ClubApplicationSubmissionResponse } from '@workspace/api/generated';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog';
import { Check, User, X } from 'lucide-react';

import {
  SUBMISSION_STATUS_LABELS,
  SUBMISSION_STATUS_VARIANTS,
} from '../_helpers/constants/submissionStatus';

type Props = {
  submission: ClubApplicationSubmissionResponse | null;
  onClose: () => void;
  onApprove: (submissionId: number) => void;
  onReject: (submissionId: number) => void;
  isProcessing: boolean;
};

export const SubmissionDetailModal = ({
  submission,
  onClose,
  onApprove,
  onReject,
  isProcessing,
}: Props) => {
  return (
    <Dialog open={!!submission} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[85vh] max-w-[95vw] overflow-y-auto md:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="size-5" />
            {submission?.user?.name ?? '신청자'} 님의 신청서
          </DialogTitle>
          <DialogDescription>
            {submission?.user?.studentId} · {submission?.user?.email}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">상태:</span>
            {submission?.applicationStatus && (
              <Badge
                variant={SUBMISSION_STATUS_VARIANTS[submission.applicationStatus]}>
                {SUBMISSION_STATUS_LABELS[submission.applicationStatus]}
              </Badge>
            )}
          </div>
          {submission?.formAnswers?.map((answer, index) => (
            <div key={index} className="space-y-1">
              <p className="text-sm font-medium">
                {answer.question}
                {answer.required && (
                  <span className="text-destructive ml-1">*</span>
                )}
              </p>
              <p className="bg-muted rounded-md p-3 text-sm">
                {Array.isArray(answer.answer)
                  ? (answer.answer as string[]).join(', ')
                  : String(answer.answer ?? '-')}
              </p>
            </div>
          ))}
        </div>
        {submission?.applicationStatus === 'PENDING' && (
          <DialogFooter className="flex-row gap-2 sm:justify-end">
            <Button
              variant="destructive"
              onClick={() =>
                submission?.clubApplicationSubmissionId &&
                onReject(submission.clubApplicationSubmissionId)
              }
              disabled={isProcessing}>
              <X className="mr-1 size-4" />
              거절
            </Button>
            <Button
              onClick={() =>
                submission?.clubApplicationSubmissionId &&
                onApprove(submission.clubApplicationSubmissionId)
              }
              disabled={isProcessing}>
              <Check className="mr-1 size-4" />
              승인
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};
