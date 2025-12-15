import { type ClubApplicationSubmissionResponse } from '@workspace/api/generated';
import { Badge } from '@workspace/ui/components/badge';
import { Checkbox } from '@workspace/ui/components/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table';

import {
  SUBMISSION_STATUS_LABELS,
  SUBMISSION_STATUS_VARIANTS,
} from '../../_helpers/constants/submissionStatus';

type Props = {
  submissions: ClubApplicationSubmissionResponse[];
  selectedIds: Set<number>;
  allPendingSelected: boolean;
  somePendingSelected: boolean;
  hasPendingSubmissions: boolean;
  onSelectAll: (checked: boolean) => void;
  onSelectOne: (submissionId: number, checked: boolean) => void;
  onRowClick: (submission: ClubApplicationSubmissionResponse) => void;
};

export const SubmissionTable = ({
  submissions,
  selectedIds,
  allPendingSelected,
  somePendingSelected,
  hasPendingSubmissions,
  onSelectAll,
  onSelectOne,
  onRowClick,
}: Props) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">
            <Checkbox
              checked={allPendingSelected}
              onCheckedChange={(checked) => onSelectAll(!!checked)}
              aria-label="전체 선택"
              disabled={!hasPendingSubmissions}
              className={
                somePendingSelected ? 'data-[state=unchecked]:bg-primary/30' : ''
              }
            />
          </TableHead>
          <TableHead>이름</TableHead>
          <TableHead>학번</TableHead>
          <TableHead>이메일</TableHead>
          <TableHead>제출일</TableHead>
          <TableHead>상태</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {submissions.map((submission) => {
          const isPending = submission.applicationStatus === 'PENDING';
          const isSelected =
            submission.clubApplicationSubmissionId &&
            selectedIds.has(submission.clubApplicationSubmissionId);

          return (
            <TableRow
              key={submission.clubApplicationSubmissionId}
              className="cursor-pointer"
              onClick={() => onRowClick(submission)}>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={!!isSelected}
                  onCheckedChange={(checked) =>
                    submission.clubApplicationSubmissionId &&
                    onSelectOne(submission.clubApplicationSubmissionId, !!checked)
                  }
                  disabled={!isPending}
                  aria-label={`${submission.user?.name ?? '신청자'} 선택`}
                />
              </TableCell>
              <TableCell className="font-medium">
                {submission.user?.name ?? '-'}
              </TableCell>
              <TableCell>{submission.user?.studentId ?? '-'}</TableCell>
              <TableCell>{submission.user?.email ?? '-'}</TableCell>
              <TableCell>
                {submission.submittedAt
                  ? new Date(submission.submittedAt).toLocaleDateString('ko-KR')
                  : '-'}
              </TableCell>
              <TableCell>
                {submission.applicationStatus && (
                  <Badge
                    variant={SUBMISSION_STATUS_VARIANTS[submission.applicationStatus]}>
                    {SUBMISSION_STATUS_LABELS[submission.applicationStatus]}
                  </Badge>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
