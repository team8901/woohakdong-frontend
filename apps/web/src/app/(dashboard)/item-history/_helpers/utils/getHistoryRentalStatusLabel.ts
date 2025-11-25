import { type ClubItemHistoryRentalStatusLabel } from '@/app/(dashboard)/item-history/_helpers/constants/clubItemHistoryRentalStatus';
import { type ClubItemHistoryResponse } from '@/data/club/getClubItemHistory/type';

export const getHistoryRentalStatusLabel = (
  item: ClubItemHistoryResponse,
): ClubItemHistoryRentalStatusLabel => {
  if (item.overdue) return '연체';

  if (item.returnDate) return '반납 완료';

  return '대여 중';
};
