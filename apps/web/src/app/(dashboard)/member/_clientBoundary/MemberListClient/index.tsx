'use client';

import { ExportButtonClient } from '@/app/(dashboard)/member/_clientBoundary/ExportButtonClient';
import { MemberFilter } from '@/app/(dashboard)/member/_components/MemberFilter';
import { MemberTable } from '@/app/(dashboard)/member/_components/MemberTable';
import { useMemberFilter } from '@/app/(dashboard)/member/_helpers/hooks/useMemberFilter';

type Props = {
  // TODO: 타입 변경
  initialData: string[];
};

export const MemberListClient = ({ initialData }: Props) => {
  // TODO: useSuspenseQuery
  const members: string[] = initialData;

  // FIXME: 내보내진 상태가 너무 많음. 줄일 수 있는 방법이 있을까?
  const {
    nameQuery,
    departmentQuery,
    roleQuery,
    genderQuery,
    sortOption,
    handleNameQueryChange,
    handleNameQueryClear,
    handleDepartmentQueryChange,
    handleDepartmentQueryClear,
    handleRoleChange,
    handleGenderChange,
    handleSortOptionChange,
    handleSearch,
  } = useMemberFilter();

  return (
    <div className="space-y-6">
      <MemberFilter
        nameQuery={nameQuery}
        departmentQuery={departmentQuery}
        roleQuery={roleQuery}
        genderQuery={genderQuery}
        sortOption={sortOption}
        handleNameQueryChange={handleNameQueryChange}
        handleNameQueryClear={handleNameQueryClear}
        handleDepartmentQueryChange={handleDepartmentQueryChange}
        handleDepartmentQueryClear={handleDepartmentQueryClear}
        handleRoleChange={handleRoleChange}
        handleGenderChange={handleGenderChange}
        handleSortOptionChange={handleSortOptionChange}
        handleSearch={handleSearch}
      />
      <div>
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">
            <span className="text-foreground font-semibold">
              {members.length}
            </span>{' '}
            명 회원 조회됨
          </p>
          <ExportButtonClient members={members} />
        </div>
        <MemberTable members={members} />
      </div>
    </div>
  );
};
