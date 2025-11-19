import { useState } from 'react';

import { type ClubItemCategory } from '@/app/(dashboard)/item/_helpers/constants/clubItemCategory';
import {
  CLUB_ITEM_SORT_OPTION,
  type ClubItemSortOption,
} from '@/app/(dashboard)/item/_helpers/constants/sortOption';
import { type ClubItemHistoryRentalStatus } from '@/app/(dashboard)/item-history/_helpers/constants/clubItemHistoryRentalStatus';
import {
  DEFAULT_OPTION,
  DEFAULT_QUERY,
  type DefaultOption,
} from '@/app/(dashboard)/member/_helpers/constants/defaultOption';

export const useItemHistoryFilter = () => {
  const [nameQuery, setNameQuery] = useState(DEFAULT_QUERY);
  const [renterQuery, setRenterQuery] = useState(DEFAULT_QUERY);
  const [categoryQuery, setCategoryQuery] = useState<
    ClubItemCategory | DefaultOption
  >(DEFAULT_OPTION);
  const [rentalStatusQuery, setRentalStatusQuery] = useState<
    ClubItemHistoryRentalStatus | DefaultOption
  >(DEFAULT_OPTION);
  const [sortOption, setSortOption] = useState<ClubItemSortOption>(
    CLUB_ITEM_SORT_OPTION.최신순,
  );

  const handleNameQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNameQuery(e.target.value);
  };

  const handleNameQueryClear = () => {
    setNameQuery(DEFAULT_QUERY);
  };

  const handleRenterQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRenterQuery(e.target.value);
  };

  const handleRenterQueryClear = () => {
    setRenterQuery(DEFAULT_QUERY);
  };

  const handleCategoryChange = (value: ClubItemCategory | DefaultOption) => {
    setCategoryQuery(value);
  };

  const handleRentalStatusChange = (
    value: ClubItemHistoryRentalStatus | DefaultOption,
  ) => {
    setRentalStatusQuery(value);
  };

  const handleSortOptionChange = (value: ClubItemSortOption) => {
    setSortOption(value);
  };

  return {
    filters: {
      nameQuery,
      renterQuery,
      categoryQuery,
      rentalStatusQuery,
      sortOption,
    },
    handlers: {
      handleNameQueryChange,
      handleNameQueryClear,
      handleRenterQueryChange,
      handleRenterQueryClear,
      handleCategoryChange,
      handleRentalStatusChange,
      handleSortOptionChange,
    },
  };
};
