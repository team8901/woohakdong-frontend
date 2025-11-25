'use client';

import { useForm } from 'react-hook-form';

import { useImage } from '@/_shared/helpers/hooks/useImage';
import { showToast } from '@/_shared/helpers/utils/showToast';
import {
  type ClubInfoFormData,
  clubInfoSchema,
} from '@/app/(dashboard)/club-info/_helpers/schemas/clubInfo';
import { type ClubMemberRole } from '@/app/(dashboard)/member/_helpers/constants/clubMemberRole';
import { uploadImageToS3 } from '@/app/register-club/_helpers/utils/uploadImageToS3';
import { usePutClubInfoMutation } from '@/data/club/putClubInfo/mutation';
import { zodResolver } from '@hookform/resolvers/zod';
import { type ClubInfoResponse } from '@workspace/api/generated';
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
import { ImageIcon, Upload } from 'lucide-react';
import Image from 'next/image';

type Props = {
  clubMemberRole: ClubMemberRole;
  initialData: ClubInfoResponse;
};

const MAX_IMAGE_LENGTH = 1;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const ClubInfoFormClient = ({ clubMemberRole, initialData }: Props) => {
  const { mutateAsync: updateClubInfo } = usePutClubInfoMutation(
    initialData.id!,
  );
  const { imagePreviewUrl, image, onChangeImage } = useImage({
    maxFileSize: MAX_FILE_SIZE,
    maxImageLength: MAX_IMAGE_LENGTH,
  });

  const form = useForm<ClubInfoFormData>({
    resolver: zodResolver(clubInfoSchema),
    mode: 'onChange',
    defaultValues: {
      clubProfileImage: undefined,
      clubName: initialData.name ?? '',
      clubEnglishName: initialData.nameEn ?? '',
      clubDescription: initialData.description ?? '',
    },
  });

  const onSubmit = async (data: ClubInfoFormData): Promise<void> => {
    try {
      const thumbnailImageUrl = image
        ? await uploadImageToS3({ image, imageResourceType: 'CLUB_PROFILE' })
        : initialData.thumbnailImageUrl;

      await updateClubInfo({
        data: {
          description: data.clubDescription,
          thumbnailImageUrl,
          bannerImageUrl: initialData.bannerImageUrl,
          roomInfo: initialData.roomInfo,
          groupChatLink: initialData.groupChatLink,
          dues: initialData.dues,
        },
      });

      showToast({
        message: '동아리 정보가 수정되었어요',
        type: 'success',
      });
    } catch (error) {
      console.error('동아리 정보 수정 중 오류 발생:', error);
      showToast({
        message: '동아리 정보 수정에 실패했어요',
        type: 'error',
      });
    }
  };

  const isMember = clubMemberRole === 'MEMBER';

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-6">
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

        <div className="flex items-center gap-3">
          <FormField
            control={form.control}
            name="clubName"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>동아리명</FormLabel>
                <FormControl>
                  <Input type="text" {...field} readOnly />
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
                  <Input type="text" {...field} readOnly />
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
            disabled={!form.formState.isValid || form.formState.isSubmitting}
            aria-label="저장하기">
            {form.formState.isSubmitting ? (
              <>
                <Spinner />
                저장 중...
              </>
            ) : (
              '저장'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};
