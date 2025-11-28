'use client';

import { useMemo } from 'react';

import {
  getSearchClubsQueryKey,
  type ListWrapperClubInfoResponse,
  useSearchClubs,
} from '@workspace/api/generated';

type Props = {
  initialData: ListWrapperClubInfoResponse;
};

export const ClubInfoSearchClient = ({ initialData }: Props) => {
  const { data } = useSearchClubs(
    { name: '두잇', nameEn: 'doit' },
    {
      query: {
        queryKey: getSearchClubsQueryKey({ name: '두잇', nameEn: 'doit' }),
        initialData,
      },
    },
  );

  // initialData가 있으므로 data는 항상 존재
  const clubs = useMemo(() => data!.data ?? [], [data]);

  return (
    <div>
      <p>동아리 검색 결과</p>
      {clubs.length === 0 && <span>없음</span>}
      <ul>
        {clubs.map((v) => (
          <li key={v.id}>
            {v.name}: {v.description}
          </li>
        ))}
      </ul>
    </div>
  );
};
