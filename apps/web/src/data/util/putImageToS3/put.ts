import { type ImageToS3RequestData } from '@/data/util/putImageToS3/type';

export const putImageToS3 = async ({
  s3ImageUrl,
  fileBytes,
}: ImageToS3RequestData) => {
  await fetch(s3ImageUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    body: fileBytes,
  });
};
