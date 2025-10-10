import { type S3ImageUrlResponse } from '@/data/util/getS3ImageUrl/type';

export const URL_얻어오기_성공: S3ImageUrlResponse = {
  presignedUrl: `https://ip-file-upload-test.s3.ap-northeast-2.amazonaws.com/assets/${Math.random().toString(36).substring(2, 11)}.png`,
};
