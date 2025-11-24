import { type ClubItemResponse } from '@/data/club/getClubItems/type';

export const getRentalStatusText = (item: ClubItemResponse) => {
  if (item.using) return '대여 중';

  if (item.available) return '대여 가능';

  return '대여 잠금';
};
