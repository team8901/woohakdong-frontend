import { putImageToS3 } from '@/data/util/putImageToS3/put';
import {
  getPresignedUrls,
  type GetPresignedUrlsParams,
} from '@workspace/api/generated';

type Params = { image: ArrayBuffer } & GetPresignedUrlsParams;

/** S3에 이미지를 업로드하는 함수 */
export const uploadImageToS3 = async ({ image, imageResourceType }: Params) => {
  const { presignedUrl } = await getPresignedUrls({
    imageResourceType,
  });

  if (!presignedUrl) {
    throw new Error('Failed to get presigned URL');
  }

  await putImageToS3({
    s3ImageUrl: presignedUrl,
    image,
  });

  return presignedUrl;
};
