'use client';

import { type UseFormReturn } from 'react-hook-form';

import { Button } from '@workspace/ui/components/button';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@workspace/ui/components/form';
import { Input } from '@workspace/ui/components/input';
import { Textarea } from '@workspace/ui/components/textarea';
import {
  Check,
  Copy,
  Download,
  Image as ImageIcon,
  Upload,
} from 'lucide-react';
import Image from 'next/image';
import { QRCodeCanvas } from 'qrcode.react';

import { type ClubInfoFormData } from '../_helpers/hooks/useClubInfoForm';

type Props = {
  form: UseFormReturn<ClubInfoFormData>;
  imagePreviewUrl: string;
  onChangeImage: (e: React.ChangeEvent<HTMLInputElement>) => void;
  clubFullUrl: string;
  onCopy: () => void;
  isCopied: boolean;
  qrCodeRef: React.RefObject<HTMLDivElement | null>;
  onDownloadQr: () => void;
  isMember?: boolean;
};

export const ClubInfoContent = ({
  form,
  imagePreviewUrl,
  onChangeImage,
  clubFullUrl,
  onCopy,
  isCopied,
  qrCodeRef,
  onDownloadQr,
  isMember,
}: Props) => {
  return (
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
                    <span>권장: 256x256px 이하, png or jpeg (5MB 이하)</span>
                  </FormDescription>
                </div>
              )}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="clubName"
        render={({ field }) => (
          <FormItem>
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
          <FormItem>
            <FormLabel>동아리 영문명</FormLabel>
            <FormControl>
              <Input type="text" {...field} disabled={isMember} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

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

      <FormLabel>동아리 웹 페이지 주소</FormLabel>
      <div className="relative">
        <Input value={clubFullUrl} readOnly />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 -translate-y-1/2"
          onClick={onCopy}>
          {isCopied ? <Check className="text-green-500" /> : <Copy />}
        </Button>
      </div>

      <div className="space-y-2">
        <FormLabel>QR 카드</FormLabel>
        <div className="flex items-center gap-4">
          <div
            ref={qrCodeRef}
            className="border-border flex w-fit flex-col items-center gap-2 rounded-lg border bg-white p-4">
            <QRCodeCanvas value={clubFullUrl} size={128} />
            <p className="text-sm font-bold">{form.getValues('clubName')}</p>
          </div>
          <Button type="button" variant="secondary" onClick={onDownloadQr}>
            <Download />
            다운로드
          </Button>
        </div>
      </div>
    </div>
  );
};
