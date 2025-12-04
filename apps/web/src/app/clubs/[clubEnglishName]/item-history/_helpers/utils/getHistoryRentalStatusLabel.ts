import { type ClubItemHistoryRentalStatusLabel } from '@/app/clubs/[clubEnglishName]/item-history/_helpers/constants/clubItemHistoryRentalStatus';
import { type ClubItemHistoryResponse } from '@workspace/api/generated';

export const getHistoryRentalStatusLabel = (
  item: ClubItemHistoryResponse,
): ClubItemHistoryRentalStatusLabel => {
  if (item.overdue) return '연체';

  if (item.returnDate) return '반납 완료';

  return '대여 중';
};
