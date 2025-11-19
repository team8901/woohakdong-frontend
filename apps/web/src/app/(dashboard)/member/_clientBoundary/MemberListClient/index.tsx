'use client';

import { useMemo } from 'react';

import { ExportButtonClient } from '@/app/(dashboard)/member/_clientBoundary/ExportButtonClient';
import { MemberFilter } from '@/app/(dashboard)/member/_components/MemberFilter';
import { MemberTable } from '@/app/(dashboard)/member/_components/MemberTable';
import { DEFAULT_OPTION } from '@/app/(dashboard)/member/_helpers/constants/defaultOption';
import { CLUB_MEMBER_SORT_OPTION } from '@/app/(dashboard)/member/_helpers/constants/sortOption';
import { useMemberFilter } from '@/app/(dashboard)/member/_helpers/hooks/useMemberFilter';
import { type ClubMembersResponse } from '@/data/club/getClubMembers/type';

type Props = {
  initialData: ClubMembersResponse[];
};

export const MemberListClient = ({ initialData }: Props) => {
  // TODO: useSuspenseQuery
  const { filters, handlers } = useMemberFilter();
  const { nameQuery, departmentQuery, roleQuery, genderQuery, sortOption } =
    filters;

  const filteredMembers = useMemo(() => {
    let filtered = initialData;

    // Apply name filter
    if (nameQuery) {
      filtered = filtered.filter((member) =>
        member.name.toLowerCase().includes(nameQuery.toLowerCase()),
      );
    }

    // Apply department/major filter
    if (departmentQuery) {
      filtered = filtered.filter((member) =>
        member.major.toLowerCase().includes(departmentQuery.toLowerCase()),
      );
    }

    // Apply role filter
    if (roleQuery !== DEFAULT_OPTION) {
      filtered = filtered.filter((member) => member.role === roleQuery);
    }

    // Apply gender filter
    if (genderQuery !== DEFAULT_OPTION) {
      filtered = filtered.filter((member) => member.gender === genderQuery);
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      if (sortOption === CLUB_MEMBER_SORT_OPTION.가입일) {
        return (
          new Date(b.joinedDate).getTime() - new Date(a.joinedDate).getTime()
        );
      }

      if (sortOption === CLUB_MEMBER_SORT_OPTION.이름) {
        return a.name.localeCompare(b.name);
      }

      if (sortOption === CLUB_MEMBER_SORT_OPTION.학과) {
        return a.major.localeCompare(b.major);
      }

      return 0;
    });

    return filtered;
  }, [
    initialData,
    nameQuery,
    departmentQuery,
    roleQuery,
    genderQuery,
    sortOption,
  ]);

  return (
    <div className="space-y-6">
      <MemberFilter filters={filters} handlers={handlers} />
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">
            <span className="text-foreground font-semibold">
              {filteredMembers.length}
            </span>{' '}
            명 회원 조회됨
          </p>
          <ExportButtonClient members={filteredMembers} />
        </div>
        <MemberTable members={filteredMembers} />
      </div>
    </div>
  );
};
