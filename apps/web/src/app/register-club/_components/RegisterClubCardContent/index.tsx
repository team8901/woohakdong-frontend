import { type UseFormReturn } from 'react-hook-form';

import { type RegisterClubFormData } from '@/app/register-club/_helpers/hooks/useRegisterClubForm';
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
import { Image as ImageIcon, UploadIcon } from 'lucide-react';
import Image from 'next/image';

type Props = {
  form: UseFormReturn<RegisterClubFormData>;
  imagePreviewUrl: string;
  onChangeImage: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export const RegisterClubCardContent = ({
  form,
  imagePreviewUrl,
  onChangeImage,
}: Props) => {
  return (
    <div className="flex flex-col gap-6">
      {/* 로고 업로드 */}
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

                  field.onChange(file); // Zod에서 File로 유효성 검사 가능

                  onChangeImage(e); // 이미지 미리보기 업데이트
                }}
              />
            </FormControl>
            <div className="flex items-center gap-4">
              {/* 이미지 미리보기 */}
              <div className="flex h-[128px] w-[128px] shrink-0 items-center justify-center rounded-full border border-gray-200">
                {imagePreviewUrl ? (
                  <Image
                    src={imagePreviewUrl}
                    alt="동아리 로고"
                    className="h-full w-full rounded-full object-cover"
                    width={128}
                    height={128}
                  />
                ) : (
                  <ImageIcon color="gray" size={20} />
                )}
              </div>
              {/* 업로드 버튼 */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="clubProfileImage"
                  className="flex w-[116px] cursor-pointer items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm transition-all hover:bg-gray-100">
                  <UploadIcon size={16} />
                  로고 업로드
                </label>
                <span className="text-xs text-gray-500">
                  권장: 256x256px 이하, png or jpeg
                </span>
              </div>
            </div>
            <FormDescription className="flex flex-col">
              {/* TODO: 로고 유효성 검사 안내 문구 추가 */}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* 동아리명 입력 */}
      <FormField
        control={form.control}
        name="clubName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>동아리명</FormLabel>
            <FormControl>
              <Input
                type="text"
                inputMode="text"
                placeholder="Do-IT!"
                autoComplete="off"
                {...field}
              />
            </FormControl>
            <FormDescription className="flex flex-col">
              {/* TODO: 동아리명 유효성 검사 안내 문구 추가 */}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* 동아리 영문명 입력 */}
      <FormField
        control={form.control}
        name="clubEnglishName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>동아리 영문명</FormLabel>
            <FormControl>
              <Input
                type="text"
                inputMode="text"
                placeholder="doit"
                autoComplete="off"
                {...field}
              />
            </FormControl>
            <FormDescription className="flex flex-col">
              {/* TODO: 동아리 영문명 유효성 검사 안내 문구 추가 */}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* 설명 입력 */}
      <FormField
        control={form.control}
        name="clubDescription"
        render={({ field }) => (
          <FormItem>
            <FormLabel>설명</FormLabel>
            <FormControl>
              <Textarea
                className="text-sm placeholder:text-sm"
                placeholder="동아리를 소개해주세요"
                autoComplete="off"
                {...field}
              />
            </FormControl>
            <FormDescription className="flex flex-col">
              {/* TODO: 설명 유효성 검사 안내 문구 추가 */}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
