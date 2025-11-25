'use client';

import { useRef, useState } from 'react';

import { buildUrlWithParams } from '@/_shared/helpers/utils/buildUrlWithParams';
import { showToast } from '@/_shared/helpers/utils/showToast';
import { ClubInfoContent } from '@/app/(dashboard)/club-info/_components/ClubInfoContent';
import { ClubInfoFooter } from '@/app/(dashboard)/club-info/_components/ClubInfoFooter';
import { useClubInfoForm } from '@/app/(dashboard)/club-info/_helpers/hooks/useClubInfoForm';
import { type ClubMemberRole } from '@/app/(dashboard)/member/_helpers/constants/clubMemberRole';
import { CardContent, CardFooter } from '@workspace/ui/components/card';
import { Form } from '@workspace/ui/components/form';
import { toPng } from 'html-to-image';

type Props = {
  clubMemberRole: ClubMemberRole;
};

export const ClubInfoFormClient = ({ clubMemberRole }: Props) => {
  const {
    form,
    isFormValid,
    isSubmitting,
    imagePreviewUrl,
    onSubmit,
    onChangeImage,
  } = useClubInfoForm();

  const [isCopied, setIsCopied] = useState(false);
  const qrCodeRef = useRef<HTMLDivElement>(null);

  const clubEnglishName = form.getValues('clubEnglishName');

  const clubUrl = buildUrlWithParams({
    url: `/clubs/[clubEnglishName]`,
    pathParams: { clubEnglishName },
  });

  const clubFullUrl =
    typeof window !== 'undefined' ? `${window.location.origin}${clubUrl}` : '';

  const onCopy = () => {
    navigator.clipboard.writeText(clubFullUrl).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const onDownloadQr = () => {
    if (!qrCodeRef.current) {
      return;
    }

    toPng(qrCodeRef.current, { cacheBust: true })
      .then((dataUrl) => {
        const link = document.createElement('a');

        link.download = `${clubEnglishName}-qrcode.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.error('QR 코드 다운로드에 실패했습니다.', err);
        showToast({
          message: 'QR 코드 다운로드에 실패했어요. 다시 시도해주세요.',
          type: 'error',
        });
      });
  };

  const isMember = clubMemberRole === 'MEMBER';

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-6">
          <CardContent>
            <ClubInfoContent
              form={form}
              imagePreviewUrl={imagePreviewUrl}
              onChangeImage={onChangeImage}
              clubFullUrl={clubFullUrl}
              onCopy={onCopy}
              isCopied={isCopied}
              qrCodeRef={qrCodeRef}
              onDownloadQr={onDownloadQr}
              isMember={isMember}
            />
          </CardContent>

          <CardFooter>
            <ClubInfoFooter
              isFormValid={isFormValid}
              isSubmitting={isSubmitting}
              isMember={isMember}
            />
          </CardFooter>
        </div>
      </form>
    </Form>
  );
};
