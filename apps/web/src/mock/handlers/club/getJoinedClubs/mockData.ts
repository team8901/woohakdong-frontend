import type { ListWrapperClubInfoResponse } from '@workspace/api/generated';

export const 내가_가입한_동아리_목록: ListWrapperClubInfoResponse = {
  data: [
    {
      id: 1,
      name: '두잇',
      nameEn: 'doit',
      description:
        '두잇은 IT 기술에 관심있는 학생들이 모여 함께 성장하는 동아리입니다. 웹 개발, 앱 개발, 알고리즘 스터디 등 다양한 활동을 하고 있어요.',
      thumbnailImageUrl:
        'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=256&h=256&fit=crop',
      bannerImageUrl:
        'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=400&fit=crop',
      roomInfo: '공학관 305호',
      groupChatLink: 'https://open.kakao.com/o/gABCDEFG',
      dues: 10000,
    },
    {
      id: 2,
      name: '멋쟁이사자처럼',
      nameEn: 'likelion',
      description:
        '멋쟁이사자처럼은 기획자, 디자이너, 개발자가 함께 서비스를 만드는 동아리입니다.',
      thumbnailImageUrl:
        'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=256&h=256&fit=crop',
      bannerImageUrl:
        'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&h=400&fit=crop',
      roomInfo: '학생회관 201호',
      groupChatLink: 'https://open.kakao.com/o/gXYZ12345',
      dues: 20000,
    },
  ],
};
