'use client';

import { useEffect, useRef, useState } from 'react';

import { APP_PATH } from '@/_shared/helpers/constants/appPath';
import { buildUrlWithParams } from '@/_shared/helpers/utils/buildUrlWithParams';
import { showToast } from '@/_shared/helpers/utils/showToast';
import { RegisterClubSuccessCardFooter } from '@/app/register-club/success/_components/RegisterClubSuccessCardFooter';
import { CardContent } from '@workspace/ui/components/card';
import { Input } from '@workspace/ui/components/input';
import { toPng } from 'html-to-image';
import { Check, Copy } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { QRCodeCanvas } from 'qrcode.react';

export const COPY_SUCCESS_TIMEOUT = 2000;
export const QR_CODE_SIZE = 183;

export const QrCardClient = () => {
  const { clubEnglishName } = useParams<{ clubEnglishName: string }>();
  const [isCopied, setIsCopied] = useState(false);
  const [origin, setOrigin] = useState('');

  const qrCodeRef = useRef<HTMLDivElement>(null);

  const router = useRouter();

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

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

  const clubUrl = buildUrlWithParams({
    url: APP_PATH.CLUBS.HOME,
    pathParams: { clubEnglishName },
  });

  const onGoNext = () => {
    router.replace(clubUrl);
  };

  const clubFullUrl = origin + clubUrl;

  const onCopy = () => {
    navigator.clipboard.writeText(clubFullUrl).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), COPY_SUCCESS_TIMEOUT);
    });
  };

  return (
    <CardContent className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <span className="text-sm text-gray-900">동아리 웹 페이지 주소</span>
        <div className="relative w-full">
          <Input value={clubFullUrl} readOnly />
          <button
            onClick={onCopy}
            className="absolute inset-y-0 right-0 flex items-center pr-3">
            {isCopied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2">
        <span className="self-start text-sm text-gray-900">QR 카드</span>
        <div
          ref={qrCodeRef}
          className="flex w-[285px] flex-col items-center gap-4 rounded-2xl border border-gray-200 bg-white px-12 py-6">
          <span className="text-primary text-3xl font-bold">
            {clubEnglishName}
          </span>
          <QRCodeCanvas
            value={clubFullUrl}
            size={QR_CODE_SIZE}
            className="border-primary rounded-2xl border-4 p-4"
          />
          <p className="text-center text-sm font-bold">
            QR 코드를 스캔하면
            <br />
            동아리 전용 페이지로 이동해요!
          </p>
          <span className="text-xs text-gray-600">우학동 제공</span>
        </div>
      </div>

      <RegisterClubSuccessCardFooter
        onDownloadQr={onDownloadQr}
        onGoNext={onGoNext}
      />
    </CardContent>
  );
};
