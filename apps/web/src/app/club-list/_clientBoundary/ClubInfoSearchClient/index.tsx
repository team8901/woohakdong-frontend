'use client';

import { useGetClubInfoSearchSuspenseQuery } from '@/data/club/getClubInfoSearch/query';
import { ClubInfoSearchResponse } from '@/data/club/getClubInfoSearch/type';

type Props = {
  initialData: ClubInfoSearchResponse;
};

export const ClubInfoSearchClient = ({ initialData }: Props) => {
  const { data } = useGetClubInfoSearchSuspenseQuery(
    { name: '두잇', nameEn: 'doit' },
    { initialData },
  );

  return (
    <div>
      <p>동아리 검색 결과</p>
      <ul>
        {data.data.map((v) => (
          <li key={v.id}>
            {v.name}: {v.description}
          </li>
        ))}
      </ul>
    </div>
  );
};
