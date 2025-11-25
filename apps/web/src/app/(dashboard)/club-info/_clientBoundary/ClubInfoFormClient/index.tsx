'use client';

import { useRef, useState } from 'react';

import { APP_PATH } from '@/_shared/helpers/constants/appPath';
import { buildUrlWithParams } from '@/_shared/helpers/utils/buildUrlWithParams';
import { showToast } from '@/_shared/helpers/utils/showToast';
import { useClubInfoForm } from '@/app/(dashboard)/club-info/_helpers/hooks/useClubInfoForm';
import { type ClubMemberRole } from '@/app/(dashboard)/member/_helpers/constants/clubMemberRole';
import { QR_CODE_SIZE } from '@/app/register-club/success/_clientBoundary/QrCardClient';
import { Button } from '@workspace/ui/components/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@workspace/ui/components/form';
import { Input } from '@workspace/ui/components/input';
import { Spinner } from '@workspace/ui/components/spinner';
import { Textarea } from '@workspace/ui/components/textarea';
import { toPng } from 'html-to-image';
import { Check, Copy, DownloadIcon, ImageIcon, Upload } from 'lucide-react';
import Image from 'next/image';
import { QRCodeCanvas } from 'qrcode.react';

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

  const clubEnglishName: string = form.getValues('clubEnglishName');

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

  const clubFullUrl =
    window === undefined ? '' : `${window.location.origin}${clubUrl}`;

  const onCopy = () => {
    navigator.clipboard.writeText(clubFullUrl).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const isMember = clubMemberRole === 'MEMBER';

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-12">
        <div className="flex flex-col gap-6">
          <FormField
            control={form.control}
            name="clubProfileImage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>로고</FormLabel>
                <FormControl>
                  <Input
                    className="hidden"
                    id="clubProfileImage"
                    type="file"
                    accept="image/png, image/jpeg"
                    onChange={(e) => {
                      const file = e.target.files?.[0];

                      field.onChange(file);
                      onChangeImage(e);
                    }}
                    disabled={isMember}
                  />
                </FormControl>
                <div className="flex items-center gap-4">
                  <div className="border-border flex h-[128px] w-[128px] shrink-0 items-center justify-center rounded-full border">
                    {imagePreviewUrl ? (
                      <Image
                        src={imagePreviewUrl}
                        alt="동아리 로고"
                        className="h-full w-full rounded-full object-cover"
                        width={128}
                        height={128}
                      />
                    ) : (
                      <ImageIcon className="text-muted-foreground" size={20} />
                    )}
                  </div>
                  {!isMember && (
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        className="w-fit"
                        type="button"
                        onClick={() =>
                          document.getElementById('clubProfileImage')?.click()
                        }>
                        <Upload />
                        로고 변경
                      </Button>
                      <FormDescription className="text-xs">
                        <span>
                          권장: 256x256px 이하, png or jpeg (5MB 이하)
                        </span>
                      </FormDescription>
                    </div>
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center gap-3">
            <FormField
              control={form.control}
              name="clubName"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>동아리명</FormLabel>
                  <FormControl>
                    <Input type="text" {...field} disabled={isMember} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="clubEnglishName"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>동아리 영문명</FormLabel>
                  <FormControl>
                    <Input type="text" {...field} disabled={isMember} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="clubDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>설명</FormLabel>
                <FormControl>
                  <Textarea {...field} disabled={isMember} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex w-full justify-end">
            <Button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              aria-label="저장하기">
              {isSubmitting ? (
                <>
                  <Spinner />
                  저장 중...
                </>
              ) : (
                '저장'
              )}
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <FormLabel>동아리 웹 페이지 주소</FormLabel>
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

          <div className="flex flex-col gap-3 md:flex-row md:justify-between">
            <div className="flex flex-col items-center gap-2">
              <FormLabel className="self-start">QR 카드</FormLabel>
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

            <Button type="button" onClick={onDownloadQr} className="self-end">
              <DownloadIcon />
              QR 카드 다운로드
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};
