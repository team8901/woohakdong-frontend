import { type ClubItemDetailResponse } from '@workspace/api/generated';

export const 동아리_물품_상세_대여가능: ClubItemDetailResponse = {
  id: 0,
  name: '노트북',
  photo: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400',
  description: '고성능 게이밍 노트북',
  location: '동아리실',
  category: 'DIGITAL',
  rentalMaxDay: 7,
  available: true,
  using: false,
  rentalDate: undefined,
  rentalTime: 0,
  borrowerId: undefined,
  borrowerName: undefined,
  dueDate: undefined,
};

export const 동아리_물품_상세_대여중: ClubItemDetailResponse = {
  id: 1,
  name: '프로젝터',
  photo: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400',
  description: '고화질 프로젝터',
  location: '동아리실',
  category: 'DIGITAL',
  rentalMaxDay: 3,
  available: false,
  using: true,
  rentalDate: '2024-06-15',
  rentalTime: 14,
  borrowerId: 1,
  borrowerName: '홍길동',
  dueDate: '2024-06-18',
};
