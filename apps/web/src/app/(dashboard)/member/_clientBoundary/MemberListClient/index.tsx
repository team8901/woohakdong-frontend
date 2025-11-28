'use client';

import { useMemo, useState } from 'react';

import { ExportButtonClient } from '@/app/(dashboard)/member/_clientBoundary/ExportButtonClient';
import { MemberFilter } from '@/app/(dashboard)/member/_components/MemberFilter';
import { MemberTable } from '@/app/(dashboard)/member/_components/MemberTable';
import { DEFAULT_OPTION } from '@/app/(dashboard)/member/_helpers/constants/defaultOption';
import { CLUB_MEMBER_SORT_OPTION } from '@/app/(dashboard)/member/_helpers/constants/sortOption';
import { useMemberFilter } from '@/app/(dashboard)/member/_helpers/hooks/useMemberFilter';
import {
  type ClubMembershipResponse,
  getGetClubMembersQueryKey,
  type ListWrapperClubMembershipResponse,
  useGetClubMembers,
} from '@workspace/api/generated';

type Props = {
  initialData: ListWrapperClubMembershipResponse;
  clubId: number;
};

export const MemberListClient = ({ initialData, clubId }: Props) => {
  const { data } = useGetClubMembers(clubId, {
    query: {
      queryKey: getGetClubMembersQueryKey(clubId),
      initialData,
    },
  });

  // initialData가 있으므로 data는 항상 존재
  const members: ClubMembershipResponse[] = useMemo(
    () => data!.data ?? [],
    [data],
  );

  const [selectedMembers, setSelectedMembers] = useState<
    ClubMembershipResponse[]
  >([]);
  const { filters, handlers } = useMemberFilter();
  const { nameQuery, departmentQuery, roleQuery, genderQuery, sortOption } =
    filters;

  const filteredMembers = useMemo(() => {
    let filtered = members ?? [];

    // Apply name filter
    if (nameQuery) {
      filtered = filtered.filter((member) =>
        member.name?.toLowerCase().includes(nameQuery.toLowerCase()),
      );
    }

    // Apply department/major filter
    if (departmentQuery) {
      filtered = filtered.filter((member) =>
        member.major?.toLowerCase().includes(departmentQuery.toLowerCase()),
      );
    }

    // Apply role filter
    if (roleQuery !== DEFAULT_OPTION) {
      filtered = filtered.filter(
        (member) => member.clubMemberRole === roleQuery,
      );
    }

    // Apply gender filter
    if (genderQuery !== DEFAULT_OPTION) {
      filtered = filtered.filter((member) => member.gender === genderQuery);
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      if (sortOption === CLUB_MEMBER_SORT_OPTION.가입일) {
        const dateA = a.clubJoinDate ? new Date(a.clubJoinDate).getTime() : 0;
        const dateB = b.clubJoinDate ? new Date(b.clubJoinDate).getTime() : 0;

        return dateB - dateA;
      }

      if (sortOption === CLUB_MEMBER_SORT_OPTION.이름) {
        return (a.name ?? '').localeCompare(b.name ?? '');
      }

      if (sortOption === CLUB_MEMBER_SORT_OPTION.학과) {
        return (a.major ?? '').localeCompare(b.major ?? '');
      }

      return 0;
    });

    return filtered;
  }, [members, nameQuery, departmentQuery, roleQuery, genderQuery, sortOption]);

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
          <ExportButtonClient
            members={filteredMembers}
            selectedMembers={selectedMembers}
          />
        </div>
        <MemberTable
          members={filteredMembers}
          onSelectionChange={setSelectedMembers}
        />
      </div>
    </div>
  );
};
