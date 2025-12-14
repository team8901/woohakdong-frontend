import { useRef, useState } from 'react';

import { type ClubItemResponse } from '@workspace/api/generated';
import { Button } from '@workspace/ui/components/button';
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog';
import { Label } from '@workspace/ui/components/label';
import { Spinner } from '@workspace/ui/components/spinner';
import { Camera, X } from 'lucide-react';
import Image from 'next/image';

type Props = {
  item: ClubItemResponse;
  isSubmitting: boolean;
  onSubmit: (imageBuffer: ArrayBuffer | null) => Promise<void>;
  onCancel: () => void;
};

export const ItemReturnForm = ({
  item,
  isSubmitting,
  onSubmit,
  onCancel,
}: Props) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBuffer, setImageBuffer] = useState<ArrayBuffer | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      const previewReader = new FileReader();

      previewReader.onloadend = () => {
        setImagePreview(previewReader.result as string);
      };
      previewReader.readAsDataURL(file);

      const bufferReader = new FileReader();

      bufferReader.onloadend = () => {
        setImageBuffer(bufferReader.result as ArrayBuffer);
      };
      bufferReader.readAsArrayBuffer(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setImageBuffer(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCancel = () => {
    handleRemoveImage();
    onCancel();
  };

  const handleSubmit = () => {
    onSubmit(imageBuffer);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>물품 반납</DialogTitle>
        <DialogDescription>{item.name}</DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label>반납 인증 사진 (선택)</Label>
          <div className="flex flex-col gap-3">
            {imagePreview ? (
              <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                <Image
                  src={imagePreview}
                  alt="반납 인증 사진"
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
          <p className="text-muted-foreground text-xs">
            물품 상태를 확인할 수 있는 사진을 첨부해주세요.
          </p>
        </div>
      </div>
      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={isSubmitting}>
          취소
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Spinner />
              반납 중...
            </>
          ) : (
            '반납하기'
          )}
        </Button>
      </DialogFooter>
    </>
  );
};
