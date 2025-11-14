import { useState } from 'react';

import { useToast } from '@/_shared/helpers/hooks/useToast';
import { readFileForBytes } from '@/app/register-club/_helpers/utils/readFileForBytes';
import { readFileForPreview } from '@/app/register-club/_helpers/utils/readFileForPreview';

const MAX_IMAGE_LENGTH = 1;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const useImage = () => {
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [image, setImage] = useState<ArrayBuffer | null>(null);
  const { showToast } = useToast();

  const onChangeImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (!files) {
      return;
    }

    if (files.length > MAX_IMAGE_LENGTH) {
      showToast({
        message: '이미지는 한 개만 등록 가능해요',
        type: 'warning',
      });

      return;
    }

    const file = files[0];

    if (!file) {
      return;
    }

    // 파일 업로드 시 모든 파일 (*.*) 선택 방지 위해 이미지 type을 한 번 더 검증
    if (file.type !== 'image/png' && file.type !== 'image/jpeg') {
      showToast({
        message: 'JPG 혹은 PNG 확장자의 이미지만 등록 가능해요',
        type: 'warning',
      });

      return;
    }

    // 파일 용량 제한 검증
    if (file.size > MAX_FILE_SIZE) {
      showToast({
        message: '이미지 파일 용량은 5MB 이하만 등록 가능해요',
        type: 'warning',
      });

      return;
    }

    readFileForPreview(file, setImagePreviewUrl);
    readFileForBytes(file, setImage);
  };

  return { imagePreviewUrl, image, onChangeImage };
};
