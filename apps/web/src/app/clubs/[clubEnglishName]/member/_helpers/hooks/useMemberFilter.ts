import { useState } from 'react';

import { type ClubMemberGender } from '@/app/clubs/[clubEnglishName]/member/_helpers/constants/clubMemberGender';
import { type ClubMemberRole } from '@/app/clubs/[clubEnglishName]/member/_helpers/constants/clubMemberRole';
import {
  DEFAULT_OPTION,
  DEFAULT_QUERY,
  type DefaultOption,
} from '@/app/clubs/[clubEnglishName]/member/_helpers/constants/defaultOption';
import {
  CLUB_MEMBER_SORT_OPTION,
  type ClubMemberSortOption,
} from '@/app/clubs/[clubEnglishName]/member/_helpers/constants/sortOption';

export const useMemberFilter = () => {
  const [nameQuery, setNameQuery] = useState(DEFAULT_QUERY);
  const [departmentQuery, setDepartmentQuery] = useState(DEFAULT_QUERY);
  const [roleQuery, setRoleQuery] = useState<ClubMemberRole | DefaultOption>(
    DEFAULT_OPTION,
  );
  const [genderQuery, setGenderQuery] = useState<
    ClubMemberGender | DefaultOption
  >(DEFAULT_OPTION);
  const [sortOption, setSortOption] = useState<ClubMemberSortOption>(
    CLUB_MEMBER_SORT_OPTION.가입일,
  );

  const handleSearch = () => {};

  const handleNameQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNameQuery(e.target.value);
  };

  const handleNameQueryClear = () => {
    setNameQuery(DEFAULT_QUERY);
  };

  const handleDepartmentQueryChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setDepartmentQuery(e.target.value);
  };

  const handleDepartmentQueryClear = () => {
    setDepartmentQuery(DEFAULT_QUERY);
  };

  const handleRoleChange = (value: ClubMemberRole | DefaultOption) => {
    setRoleQuery(value);
  };

  const handleGenderChange = (value: ClubMemberGender | DefaultOption) => {
    setGenderQuery(value);
  };

  const handleSortOptionChange = (value: ClubMemberSortOption) => {
    setSortOption(value);
  };

  return {
    filters: {
      nameQuery,
      departmentQuery,
      roleQuery,
      genderQuery,
      sortOption,
    },
    handlers: {
      handleNameQueryChange,
      handleNameQueryClear,
      handleDepartmentQueryChange,
      handleDepartmentQueryClear,
      handleRoleChange,
      handleGenderChange,
      handleSortOptionChange,
      handleSearch,
    },
  };
};
