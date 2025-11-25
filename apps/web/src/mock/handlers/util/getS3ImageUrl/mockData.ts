import type { PresignedUrlResponse } from '@workspace/api/generated';

export const URL_얻어오기_성공: PresignedUrlResponse = {
  presignedUrl: `https://ip-file-upload-test.s3.ap-northeast-2.amazonaws.com/assets/${Math.random().toString(36).substring(2, 11)}.png`,
};
