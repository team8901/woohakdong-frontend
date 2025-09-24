'use client';

import { useRef } from 'react';

import { APP_PATH } from '@/_shared/helpers/constants/appPath';
import { buildUrlWithParams } from '@/_shared/helpers/utils/buildUrlWithParams';
import { RegisterClubSuccessCardFooter } from '@/app/register-club/success/_components/RegisterClubSuccessCardFooter';
import { CardContent } from '@workspace/ui/components/card';
import { useRouter, useSearchParams } from 'next/navigation';
import { QRCodeCanvas } from 'qrcode.react';

const QR_CODE_SIZE = 183;

export const QrCardClient = () => {
  const searchParams = useSearchParams();
  const clubEnglishName = searchParams.get('clubEnglishName');

  const qrCodeRef = useRef<HTMLDivElement>(null);

  const router = useRouter();

  if (!clubEnglishName) {
    alert('유효하지 않은 동아리입니다.');
    router.replace(APP_PATH.REGISTER_CLUB.HOME);

    return null;
  }

  const onDownloadQr = () => {
    const canvas = qrCodeRef.current?.querySelector('canvas');

    if (!(canvas instanceof HTMLCanvasElement)) {
      return;
    }

    const link = document.createElement('a');

    link.download = `${clubEnglishName}-qrcode.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const clubUrl = buildUrlWithParams({
    url: APP_PATH.CLUBS.HOME,
    pathParams: { clubEnglishName },
  });

  const clubFullUrl = `${window.location.origin}${clubUrl}`;

  const onGoNext = () => {
    router.replace(clubUrl);
  };

  return (
    <CardContent className="flex flex-col items-center gap-4">
      {/* TODO: 동아리 웹 페이지 주소 복사 기능 추가 */}
      <div ref={qrCodeRef}>
        <QRCodeCanvas value={clubFullUrl} size={QR_CODE_SIZE} />
      </div>
      <RegisterClubSuccessCardFooter
        onDownloadQr={onDownloadQr}
        onGoNext={onGoNext}
      />
    </CardContent>
  );
};
