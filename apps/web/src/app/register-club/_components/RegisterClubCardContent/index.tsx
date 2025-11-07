import { type UseFormReturn } from 'react-hook-form';

import { type RegisterClubFormData } from '@/app/register-club/_helpers/hooks/useRegisterClubForm';
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
              {/* 업로드 버튼 */}
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  className="w-fit"
                  type="button"
                  onClick={() =>
                    document.getElementById('clubProfileImage')?.click()
                  }>
                  <UploadIcon />
                  로고 업로드
                </Button>
                <FormDescription className="text-xs">
                  <span>권장: 256x256px 이하, png or jpeg (5MB 이하)</span>
                </FormDescription>
              </div>
            </div>
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
              <span>• 20자 이내로 입력해주세요</span>
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
              <span>• 20자 이내로 입력해주세요</span>
              <span>• 영문, 숫자만 사용 가능해요</span>
              <span>• 추후 URL 주소로 사용돼요 </span>
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
              <span>• 500자 이내로 입력해주세요</span>
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
