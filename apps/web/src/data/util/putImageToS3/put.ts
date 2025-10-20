import { type ImageToS3Request } from '@/data/util/putImageToS3/type';

/** S3에 이미지 업로드 */
export const putImageToS3 = async ({ s3ImageUrl, image }: ImageToS3Request) => {
  await fetch(s3ImageUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    body: image,
  });
};
