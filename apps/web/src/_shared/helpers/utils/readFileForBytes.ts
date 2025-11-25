/** 파일을 바이너리 데이터로 읽기 */
export const readFileForBytes = (
  file: File,
  setImage: (image: ArrayBuffer) => void,
) => {
  const reader = new FileReader();

  reader.readAsArrayBuffer(file);

  reader.onload = () => {
    if (!reader.result) {
      return;
    }

    setImage(reader.result as ArrayBuffer);
  };
};
