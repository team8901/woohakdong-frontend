/** 동아리 등록 request */
export type RegisterClubRequest = {
  name: string;
  nameEn: string;
  description: string;
  thumbnailImageUrl: string;
  bannerImageUrl: string;
  roomInfo: string;
  groupChatLink: string;
  groupChatPassword: string;
  dues: number;
};

/** 동아리 등록 response */
export type RegisterClubResponse = {
  clubId: number;
};
