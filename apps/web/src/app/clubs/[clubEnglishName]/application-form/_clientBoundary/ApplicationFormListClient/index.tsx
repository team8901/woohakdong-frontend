'use client';

import { useEffect, useState } from 'react';

import { APP_PATH } from '@/_shared/helpers/constants/appPath';
import { buildUrlWithParams } from '@/_shared/helpers/utils/buildUrlWithParams';
import { showToast } from '@/_shared/helpers/utils/showToast';
import {
  getGetAllClubApplicationFormsQueryKey,
  type ListWrapperClubApplicationFormInfoResponse,
  useGetAllClubApplicationForms,
} from '@workspace/api/generated';
import { Button } from '@workspace/ui/components/button';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import { Check, Copy, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { ApplicationFormCreateDialogClient } from '../ApplicationFormCreateDialogClient';

type Props = {
  initialData: ListWrapperClubApplicationFormInfoResponse;
  clubId: number;
  clubEnglishName: string;
};

const COPY_SUCCESS_TIMEOUT = 2000;

export const ApplicationFormListClient = ({
  initialData,
  clubId,
  clubEnglishName,
}: Props) => {
  const router = useRouter();
  const [copiedFormId, setCopiedFormId] = useState<number | null>(null);
  const [origin, setOrigin] = useState('');

  const { data } = useGetAllClubApplicationForms(clubId, {
    query: {
      queryKey: getGetAllClubApplicationFormsQueryKey(clubId),
      initialData,
    },
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  const forms = data?.data ?? [];

  const handleCopyLink = (formId: number) => {
    const joinUrl = buildUrlWithParams({
      url: APP_PATH.JOIN,
      pathParams: { clubEnglishName, formId: String(formId) },
    });
    const fullUrl = origin + joinUrl;

    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopiedFormId(formId);
      showToast({
        message: '가입 신청 링크가 복사되었습니다.',
        type: 'success',
      });
      setTimeout(() => setCopiedFormId(null), COPY_SUCCESS_TIMEOUT);
    });
  };

  const handleViewSubmissions = (formId: number) => {
    router.push(
      `/clubs/${clubEnglishName}/application-form/${formId}/submissions`,
    );
  };

  if (forms.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <ApplicationFormCreateDialogClient clubId={clubId} />
        </div>
        <Card>
          <CardHeader className="items-center justify-center py-12">
            <FileText className="text-muted-foreground mb-4 size-12" />
            <CardTitle className="text-lg">신청서가 없습니다</CardTitle>
            <CardDescription>
              새로운 가입 신청서를 만들어 동아리 회원을 모집하세요.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <ApplicationFormCreateDialogClient clubId={clubId} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {forms.map((form) => (
          <Card
            key={form.clubApplicationFormId}
            className="cursor-pointer transition-shadow hover:shadow-md"
            onClick={() =>
              form.clubApplicationFormId &&
              handleViewSubmissions(form.clubApplicationFormId)
            }>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-base">{form.name}</CardTitle>
                  <CardDescription className="mt-1">
                    {form.createdAt &&
                      new Date(form.createdAt).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}{' '}
                    생성
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();

                    if (
                      form.clubApplicationFormId !== null &&
                      form.clubApplicationFormId !== undefined
                    ) {
                      handleCopyLink(form.clubApplicationFormId);
                    }
                  }}>
                  {copiedFormId === form.clubApplicationFormId ? (
                    <Check className="size-4" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                  링크 복사
                </Button>
              </div>
              <div className="mt-3 text-sm">
                <span className="text-muted-foreground">
                  질문 {form.formContent?.length ?? 0}개
                </span>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
};
