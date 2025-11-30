import type { ListWrapperClubInfoResponse } from '@workspace/api/generated';

export const 동아리_정보_없음: ListWrapperClubInfoResponse = {
  data: [],
};

export const 동아리_정보_있음: ListWrapperClubInfoResponse = {
  data: [
    {
      id: 1,
      name: '두잇',
      nameEn: 'doit',
      description: '아주대학교 프로그래밍 동아리입니다',
      thumbnailImageUrl: '',
      bannerImageUrl: '',
      roomInfo: '구학 234호',
      groupChatLink: '',
      dues: 10000,
    },
    {
      id: 2,
      name: 'Sweat',
      nameEn: 'sweat',
      description: '아주대학교 코딩 교육 봉사 동아리입니다',
      thumbnailImageUrl: '',
      bannerImageUrl: '',
      roomInfo: '구학 200호',
      groupChatLink: '',
      dues: 20000,
    },
  ],
};
