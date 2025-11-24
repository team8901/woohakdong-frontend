import { type ClubItemCategory } from '@/app/(dashboard)/item/_helpers/constants/clubItemCategory';

export type ClubItemHistoryRequest = {
  clubId: number;
};

export type ClubItemHistoryResponse = {
  id: number;
  itemId: number;
  memberId: number;
  name: string;
  memberName: string;
  category: ClubItemCategory;
  rentalDate: string;
  dueDate: string;
  returnDate: string | null;
  returnImage: string | null;
  overdue: boolean;
};
