'use client';

import { useEffect, useRef, useState } from 'react';

import { APP_PATH } from '@/_shared/helpers/constants/appPath';
import { buildUrlWithParams } from '@/_shared/helpers/utils/buildUrlWithParams';
import { showToast } from '@/_shared/helpers/utils/showToast';
import {
  COPY_SUCCESS_TIMEOUT,
  QR_CODE_SIZE,
} from '@/app/register-club/success/_clientBoundary/QrCardClient';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { toPng } from 'html-to-image';
import { Check, Copy, DownloadIcon } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

type Props = {
  clubEnglishName: string;
  formId: number | null;
};

export const QrCardClient = ({ clubEnglishName, formId }: Props) => {
  const [origin, setOrigin] = useState('');

  const [isCopied, setIsCopied] = useState(false);
  const qrCodeRef = useRef<HTMLDivElement>(null);

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

  const joinUrl = formId
    ? buildUrlWithParams({
        url: APP_PATH.JOIN,
        pathParams: { clubEnglishName, formId: String(formId) },
      })
    : null;

  const joinFullUrl = joinUrl ? origin + joinUrl : '';

  const onCopy = () => {
    if (!joinFullUrl) return;

    navigator.clipboard.writeText(joinFullUrl).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), COPY_SUCCESS_TIMEOUT);
    });
  };

  if (!formId) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 py-12">
        <p className="text-muted-foreground text-sm">
          가입 신청서가 없습니다. 먼저 신청서를 만들어주세요.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <span className="text-sm text-gray-900">동아리 가입 신청 주소</span>
        <div className="relative w-full">
          <Input value={joinFullUrl} readOnly />
          <button
            type="button"
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

      <div className="flex flex-col gap-3 md:flex-row md:justify-between">
        <div className="flex flex-col items-center gap-2">
          <span className="self-start text-sm text-gray-900">QR 카드</span>
          <div
            ref={qrCodeRef}
            className="flex w-[285px] flex-col items-center gap-4 rounded-2xl border border-gray-200 bg-white px-12 py-6">
            <span className="text-primary text-3xl font-bold">
              {clubEnglishName}
            </span>
            <QRCodeCanvas
              value={joinFullUrl}
              size={QR_CODE_SIZE}
              className="border-primary rounded-2xl border-4 p-4"
            />
            <p className="text-center text-sm font-bold">
              QR 코드를 스캔하면
              <br />
              동아리 가입 신청 페이지로 이동해요!
            </p>
            <span className="text-xs text-gray-600">우학동 제공</span>
          </div>
        </div>

        <Button type="button" onClick={onDownloadQr} className="self-end">
          <DownloadIcon />
          QR 카드 다운로드
        </Button>
      </div>
    </div>
  );
};
