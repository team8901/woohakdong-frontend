'use client';

import { useMemo } from 'react';

import {
  getGetNoticesQueryKey,
  type ListWrapperNoticeResponse,
  type NoticeResponse,
  useGetNotices,
} from '@workspace/api/generated';

import {
  CLUB_MEMBER_ROLE,
  type ClubMemberRole,
} from '../../../member/_helpers/constants/clubMemberRole';
import { NoticeFilter } from '../../_components/NoticeFilter';
import { useNoticesFilter } from '../../_helpers/hooks/useNoticesFilter';
import { NoticeCardClient } from '../NoticeCardClient';
import { NoticePostingDialogClient } from '../NoticePostingDialogClient';

type Props = {
  initialData: ListWrapperNoticeResponse;
  clubId: number;
  clubMemberRole: ClubMemberRole;
};

export const NoticeListClient = ({
  initialData,
  clubId,
  clubMemberRole,
}: Props) => {
  const { data } = useGetNotices(clubId, {
    query: {
      queryKey: getGetNoticesQueryKey(clubId),
      initialData,
    },
  });

  const notices: NoticeResponse[] = useMemo(() => data?.data ?? [], [data]);

  const { filters, handlers } = useNoticesFilter();
  const { keywordQuery, searchQuery } = filters;

  const filteredNotices = useMemo(() => {
    if (!searchQuery) {
      return notices;
    }

    const lowerCasedSearchQuery = searchQuery.toLowerCase();

    return notices.filter((notice) => {
      switch (keywordQuery) {
        case 'content':
          return notice.content?.toLowerCase().includes(lowerCasedSearchQuery);
        case 'writer':
          return notice.writer?.toLowerCase().includes(lowerCasedSearchQuery);

        default:
          return notice.title?.toLowerCase().includes(lowerCasedSearchQuery);
      }
    });
  }, [notices, keywordQuery, searchQuery]);

  const isEditable = clubMemberRole === CLUB_MEMBER_ROLE.회장;

  return (
    <div className="space-y-6">
      <NoticeFilter filters={filters} handlers={handlers} />
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">
            <span className="text-foreground font-semibold">
              {filteredNotices.length}
            </span>{' '}
            개 공지사항 조회됨
          </p>
          {isEditable && <NoticePostingDialogClient clubId={clubId} />}
        </div>
      </div>
      <div className="grid gap-6">
        {filteredNotices.map((notice) => (
          <NoticeCardClient
            key={notice.id}
            clubId={clubId}
            notice={notice}
            clubMemberRole={clubMemberRole}
          />
        ))}
      </div>
    </div>
  );
};
