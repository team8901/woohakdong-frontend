import { API_URL } from '@/data/apiUrl';
import {
  type S3ImageUrlRequest,
  type S3ImageUrlResponse,
} from '@/data/util/getS3ImageUrl/type';
import { api } from '@workspace/api/axios';

/** S3 이미지 URL 가져오기 */
export const getS3ImageUrl = async ({
  imageResourceType,
}: S3ImageUrlRequest) => {
  const { data } = await api.get<S3ImageUrlResponse>(
    `${API_URL.UTIL.PRESIGNED_URL}?imageResourceType=${imageResourceType}`,
  );

  return data;
};
