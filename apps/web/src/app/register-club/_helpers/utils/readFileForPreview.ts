/** 파일을 Base64 인코딩하기 */
export const readFileForPreview = (
  file: File,
  setImagePreviewUrl: (url: string) => void,
) => {
  const reader = new FileReader();

  reader.readAsDataURL(file);

  reader.onload = () => {
    if (!reader.result) {
      return;
    }

    setImagePreviewUrl(reader.result as string);
  };
};
