export type S3ImageUrlRequest = {
  imageResourceType: 'CLUB_PROFILE' | 'USER_PROFILE' | 'CLUB_BANNER';
};

export type S3ImageUrlResponse = {
  presignedUrl: string;
};
