import { ClubInfoSearchResponse } from '@/data/club/getClubInfoSearch/type';

export const 동아리_정보_없음: ClubInfoSearchResponse = {
  data: [],
};

export const 동아리_정보_있음: ClubInfoSearchResponse = {
  data: [
    {
      id: 0,
      name: '두잇',
      nameEn: 'doit',
      description: '아주대학교 프로그래밍 동아리입니다',
      thumbnailImageUrl: '',
      bannerImageUrl: '',
      roomInfo: '구학 234호',
      groupChatLink: '',
      dues: 10000,
    },
  ],
};
