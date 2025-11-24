import { useState } from 'react';

import { readFileForBytes } from '@/_shared/helpers/utils/readFileForBytes';
import { readFileForPreview } from '@/_shared/helpers/utils/readFileForPreview';
import { showToast } from '@/_shared/helpers/utils/showToast';

type Props = {
  maxImageLength: number;
  maxFileSize: number;
};

export const useImage = ({ maxImageLength, maxFileSize }: Props) => {
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [image, setImage] = useState<ArrayBuffer | null>(null);

  const onChangeImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (!files) {
      return;
    }

    if (files.length > maxImageLength) {
      alert(`이미지는 ${maxImageLength}개만 등록 가능해요`);

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
    if (file.size > maxFileSize) {
      alert(
        `이미지 파일 용량은 ${maxFileSize / 1024 / 1024}MB 이하만 등록 가능해요`,
      );

      return;
    }

    readFileForPreview(file, setImagePreviewUrl);
    readFileForBytes(file, setImage);
  };

  const clearImage = () => {
    setImagePreviewUrl('');
    setImage(null);
  };

  return { imagePreviewUrl, image, onChangeImage, clearImage };
};
