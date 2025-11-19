import { type ClubItemHistoryResponse } from '@/data/club/getClubItemHistory/type';

export const getHistoryRentalStatusText = (item: ClubItemHistoryResponse) => {
  if (item.overdue) return '연체';

  if (item.returnDate) return '반납 완료';

  if (item.rentalDate && !item.returnDate && !item.overdue) return '대여 중';

  return '대여 잠금';
};
