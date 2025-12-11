'use client';

import { useMemo, useState } from 'react';

import { showToast } from '@/_shared/helpers/utils/showToast';
import { useQueryClient } from '@tanstack/react-query';
import {
  type ClubApplicationSubmissionResponse,
  getGetClubApplicationSubmissionsQueryKey,
  type ListWrapperClubApplicationSubmissionResponse,
  useGetClubApplicationSubmissions,
} from '@workspace/api/generated';
import { Button } from '@workspace/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { BulkActionBar } from '../../_components/BulkActionBar';
import { EmptySubmissionState } from '../../_components/EmptySubmissionState';
import { SubmissionDetailModal } from '../../_components/SubmissionDetailModal';
import { SubmissionTable } from '../../_components/SubmissionTable';

type Props = {
  initialData: ListWrapperClubApplicationSubmissionResponse;
  clubId: number;
  applicationFormId: number;
  clubEnglishName: string;
};

export const SubmissionListClient = ({
  initialData,
  clubId,
  applicationFormId,
  clubEnglishName,
}: Props) => {
  const queryClient = useQueryClient();
  const [selectedSubmission, setSelectedSubmission] =
    useState<ClubApplicationSubmissionResponse | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);

  const { data } = useGetClubApplicationSubmissions(clubId, applicationFormId, {
    query: {
      queryKey: getGetClubApplicationSubmissionsQueryKey(
        clubId,
        applicationFormId,
      ),
      initialData,
    },
  });

  const submissions = useMemo(() => data?.data ?? [], [data]);

  const pendingSubmissions = useMemo(
    () => submissions.filter((s) => s.applicationStatus === 'PENDING'),
    [submissions],
  );

  const allPendingSelected =
    pendingSubmissions.length > 0 &&
    pendingSubmissions.every(
      (s) =>
        s.clubApplicationSubmissionId &&
        selectedIds.has(s.clubApplicationSubmissionId),
    );

  const somePendingSelected =
    pendingSubmissions.some(
      (s) =>
        s.clubApplicationSubmissionId &&
        selectedIds.has(s.clubApplicationSubmissionId),
    ) && !allPendingSelected;

  const handleSelectAll = (checked: boolean) => {
    const newSelected = new Set(selectedIds);

    pendingSubmissions.forEach((s) => {
      if (s.clubApplicationSubmissionId) {
        if (checked) {
          newSelected.add(s.clubApplicationSubmissionId);
        } else {
          newSelected.delete(s.clubApplicationSubmissionId);
        }
      }
    });

    setSelectedIds(newSelected);
  };

  const handleSelectOne = (submissionId: number, checked: boolean) => {
    const newSelected = new Set(selectedIds);

    if (checked) {
      newSelected.add(submissionId);
    } else {
      newSelected.delete(submissionId);
    }

    setSelectedIds(newSelected);
  };

  const updateSubmissionStatus = async (
    submissionIds: number[],
    status: 'APPROVED' | 'REJECTED',
  ) => {
    setIsProcessing(true);

    try {
      // TODO: 실제 API 호출로 교체 필요
      // await updateClubApplicationSubmissions({ submissionIds, status });
      await new Promise((resolve) => setTimeout(resolve, 500));

      showToast({
        message:
          status === 'APPROVED'
            ? `${submissionIds.length}명의 신청을 승인했습니다.`
            : `${submissionIds.length}명의 신청을 거절했습니다.`,
        type: 'success',
      });

      setSelectedIds(new Set());
      setSelectedSubmission(null);

      queryClient.invalidateQueries({
        queryKey: getGetClubApplicationSubmissionsQueryKey(
          clubId,
          applicationFormId,
        ),
      });
    } catch {
      showToast({
        message: '처리 중 오류가 발생했습니다.',
        type: 'error',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkApprove = () => {
    if (selectedIds.size === 0) return;

    updateSubmissionStatus(Array.from(selectedIds), 'APPROVED');
  };

  const handleBulkReject = () => {
    if (selectedIds.size === 0) return;

    updateSubmissionStatus(Array.from(selectedIds), 'REJECTED');
  };

  const handleSingleApprove = (submissionId: number) => {
    updateSubmissionStatus([submissionId], 'APPROVED');
  };

  const handleSingleReject = (submissionId: number) => {
    updateSubmissionStatus([submissionId], 'REJECTED');
  };

  if (submissions.length === 0) {
    return <EmptySubmissionState clubEnglishName={clubEnglishName} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/clubs/${clubEnglishName}/application-form`}>
              <ArrowLeft className="size-4" />
              목록으로
            </Link>
          </Button>
        </div>
        <p className="text-muted-foreground text-sm">
          총 {submissions.length}명 신청
        </p>
      </div>

      <BulkActionBar
        selectedCount={selectedIds.size}
        onApprove={handleBulkApprove}
        onReject={handleBulkReject}
        isProcessing={isProcessing}
      />

      <Card>
        <CardHeader>
          <CardTitle>제출된 신청서</CardTitle>
          <CardDescription>
            신청자 정보를 클릭하면 상세 답변을 확인할 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SubmissionTable
            submissions={submissions}
            selectedIds={selectedIds}
            allPendingSelected={allPendingSelected}
            somePendingSelected={somePendingSelected}
            hasPendingSubmissions={pendingSubmissions.length > 0}
            onSelectAll={handleSelectAll}
            onSelectOne={handleSelectOne}
            onRowClick={setSelectedSubmission}
          />
        </CardContent>
      </Card>

      <SubmissionDetailModal
        submission={selectedSubmission}
        onClose={() => setSelectedSubmission(null)}
        onApprove={handleSingleApprove}
        onReject={handleSingleReject}
        isProcessing={isProcessing}
      />
    </div>
  );
};
