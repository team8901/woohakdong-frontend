import { type ClubItemRentalStatusLabel } from '@/app/(dashboard)/item/_helpers/constants/clubItemRentalStatus';
import { type ClubItemResponse } from '@/data/club/getClubItems/type';

export const getRentalStatusLabel = (
  item: ClubItemResponse,
): ClubItemRentalStatusLabel => {
  if (item.using) return '대여 중';

  if (item.available) return '대여 가능';

  return '대여 불가';
};
