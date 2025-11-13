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

  const { filters, handlers } = useMemberFilter();

  return (
    <div className="space-y-6">
      <MemberFilter filters={filters} handlers={handlers} />
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
