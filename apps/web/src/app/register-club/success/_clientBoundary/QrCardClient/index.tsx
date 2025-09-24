'use client';

import { useCallback, useRef } from 'react';

import { APP_PATH } from '@/_shared/helpers/constants/appPath';
import { buildUrlWithParams } from '@/_shared/helpers/utils/buildUrlWithParams';
import { RegisterClubSuccessCardFooter } from '@/app/register-club/success/_components/RegisterClubSuccessCardFooter';
import { CardContent } from '@workspace/ui/components/card';
import { useRouter, useSearchParams } from 'next/navigation';
import { QRCodeCanvas } from 'qrcode.react';

export const QrCardClient = () => {
  const searchParams = useSearchParams();
  const clubEnglishName = searchParams.get('clubEnglishName');

  const clubUrl = `${window.location.origin}/clubs/${clubEnglishName}`;

  const qrCodeRef = useRef<HTMLDivElement>(null);

  const router = useRouter();

  const onDownloadQr = useCallback(() => {
    const canvas = qrCodeRef.current?.querySelector(
      'canvas',
    ) as HTMLCanvasElement;

    if (canvas) {
      const link = document.createElement('a');

      link.download = `${clubEnglishName}-qrcode.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  }, [clubEnglishName]);

  const onGoNext = () => {
    const url = buildUrlWithParams({
      url: APP_PATH.CLUBS.HOME,
      pathParams: { clubEnglishName: clubEnglishName ?? '' },
    });

    router.replace(url);
  };

  if (!clubEnglishName) {
    alert('유효하지 않은 동아리입니다.');
    router.replace(APP_PATH.REGISTER_CLUB.HOME);

    return null;
  }

  return (
    <CardContent className="flex flex-col items-center gap-4">
      {/* TODO: 동아리 웹 페이지 주소 복사 기능 추가 */}
      <div ref={qrCodeRef}>
        <QRCodeCanvas value={clubUrl} size={183} />
      </div>
      <RegisterClubSuccessCardFooter
        onDownloadQr={onDownloadQr}
        onGoNext={onGoNext}
      />
    </CardContent>
  );
};
