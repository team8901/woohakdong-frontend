import {
  type S3ImageUrlRequestData,
  type S3ImageUrlResponseData,
} from '@/data/util/getS3ImageUrl/type';
import { api } from '@workspace/api/axios';

export const getS3ImageUrl = async ({
  imageResourceType,
}: S3ImageUrlRequestData) => {
  const res = await api.get<S3ImageUrlResponseData>(
    `/utils/images/presigned-url?imageResourceType=${imageResourceType}`,
  );

  return res.data;
};
