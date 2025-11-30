import { type ClubItemCategory } from '@/app/clubs/[clubEnglishName]/item/_helpers/constants/clubItemCategory';

export type ClubItemRequest = {
  clubId: number;
  keyword?: string;
  category?: ClubItemCategory;
};

export type ClubItemResponse = {
  id: number;
  name: string;
  photo: string;
  description: string;
  location: string;
  category: ClubItemCategory;
  rentalMaxDay: number;
  available: boolean;
  using: boolean;
  rentalDate: string | null;
  rentalTime: number;
};
