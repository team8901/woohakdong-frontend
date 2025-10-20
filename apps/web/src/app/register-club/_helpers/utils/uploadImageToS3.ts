import { getS3ImageUrl } from '@/data/util/getS3ImageUrl/fetch';
import { type S3ImageUrlRequest } from '@/data/util/getS3ImageUrl/type';
import { putImageToS3 } from '@/data/util/putImageToS3/put';

type Params = { image: ArrayBuffer } & S3ImageUrlRequest;

/** S3에 이미지를 업로드하는 함수 */
export const uploadImageToS3 = async ({ image, imageResourceType }: Params) => {
  const { presignedUrl } = await getS3ImageUrl({
    imageResourceType,
  });

  await putImageToS3({
    s3ImageUrl: presignedUrl,
    image,
  });

  return presignedUrl;
};
