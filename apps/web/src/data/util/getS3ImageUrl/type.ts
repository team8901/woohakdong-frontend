export type S3ImageUrlRequestData = {
  imageResourceType: 'CLUB_PROFILE' | 'USER_PROFILE' | 'CLUB_BANNER';
};

export type S3ImageUrlResponseData = {
  presignedUrl: string;
};
