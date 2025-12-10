'use client';

import { useRef, useState } from 'react';

import { useIsEditable } from '@/_shared/helpers/hooks/useIsEditable';
import { CLUB_ITEM_CATEGORY } from '@/app/clubs/[clubEnglishName]/item/_helpers/constants/clubItemCategory';
import { DEFAULT_MAX_RENTAL_DAYS } from '@/app/clubs/[clubEnglishName]/item/_helpers/constants/rentalConfig';
import { useCreateItemForm } from '@/app/clubs/[clubEnglishName]/item/_helpers/hooks/useCreateItemForm';
import { Button } from '@workspace/ui/components/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@workspace/ui/components/dialog';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import { Spinner } from '@workspace/ui/components/spinner';
import { Textarea } from '@workspace/ui/components/textarea';
import { Camera, PlusIcon, X } from 'lucide-react';
import Image from 'next/image';

type Props = {
  clubId: number;
};

export const ItemCreateDialogClient = ({ clubId }: Props) => {
  const isEditable = useIsEditable();
  const [isOpen, setIsOpen] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoBuffer, setPhotoBuffer] = useState<ArrayBuffer | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { form, onSubmit, onQuit, isFormValid, isSubmitting } =
    useCreateItemForm({
      clubId,
      photoBuffer,
      onSuccess: () => setIsOpen(false),
    });

  if (!isEditable) return null;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      // 미리보기용 Data URL
      const previewReader = new FileReader();

      previewReader.onloadend = () => {
        setPhotoPreview(previewReader.result as string);
      };
      previewReader.readAsDataURL(file);

      // S3 업로드용 ArrayBuffer
      const bufferReader = new FileReader();

      bufferReader.onloadend = () => {
        setPhotoBuffer(bufferReader.result as ArrayBuffer);
      };
      bufferReader.readAsArrayBuffer(file);
    }
  };

  const handleRemoveImage = () => {
    setPhotoPreview(null);
    setPhotoBuffer(null);
    form.setValue('photo', '');

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);

    if (!open) {
      onQuit();
      setPhotoPreview(null);
      setPhotoBuffer(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" size="sm">
          <PlusIcon className="size-4" />
          물품 등록
        </Button>
      </DialogTrigger>
      <DialogContent
        className="max-w-[95vw] md:max-w-md"
        onInteractOutside={(e) => e.preventDefault()}>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>물품 등록</DialogTitle>
              <DialogDescription>새로운 물품을 등록합니다.</DialogDescription>
            </DialogHeader>
            <div className="grid w-full items-center gap-4 py-4">
              <FormItem>
                <FormLabel>물품 사진</FormLabel>
                <div className="flex flex-col gap-2">
                  {photoPreview ? (
                    <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                      <Image
                        src={photoPreview}
                        alt="물품 사진 미리보기"
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="bg-destructive text-destructive-foreground absolute right-2 top-2 rounded-full p-1">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="border-muted-foreground/25 hover:border-muted-foreground/50 flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed transition-colors">
                      <Camera className="text-muted-foreground h-8 w-8" />
                      <span className="text-muted-foreground text-sm">
                        사진 첨부하기
                      </span>
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </div>
              </FormItem>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>물품명 *</FormLabel>
                    <FormControl>
                      <Input placeholder="물품명을 입력해주세요" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>카테고리 *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="카테고리를 선택해주세요" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(CLUB_ITEM_CATEGORY).map(
                          ([label, value]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>보관 위치</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="보관 위치를 입력해주세요"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>설명</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="물품에 대한 설명을 입력해주세요"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="rentalMaxDay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>최대 대여 일수 *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        inputMode="numeric"
                        min={1}
                        max={365}
                        placeholder="최대 대여 일수를 입력해주세요"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      기본값: {DEFAULT_MAX_RENTAL_DAYS}일
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onQuit}
                  disabled={isSubmitting}>
                  닫기
                </Button>
              </DialogClose>
              <Button type="submit" disabled={!isFormValid || isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Spinner />
                    등록 중...
                  </>
                ) : (
                  '등록하기'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
