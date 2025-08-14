/** 동아리 정보 검색 request */
export type ClubInfoSearchRequest = {
  /** 동아리 이름 */
  name?: string;
  /** 동아리 영문 이름 */
  nameEn?: string;
};

/** 동아리 정보 검색 response */
export type ClubInfoSearchResponse = {
  data: Array<{
    /** 동아리 id */
    id: number;
    /** 동아리 이름 */
    name: string;
    /** 동아리 영문 이름 */
    nameEn: string;
    /** 동아리 소개 */
    description: string;
    /** 동아리 썸네일 이미지 url */
    thumbnailImageUrl: string;
    /** 동아리 배너 이미지 url */
    bannerImageUrl: string;
    /** 동아리 방 정보 */
    roomInfo: string;
    /** 동아리 그룹 채팅방 링크 */
    groupChatLink: string;
    /** 동아리 회비 */
    dues: number;
  }>;
};
