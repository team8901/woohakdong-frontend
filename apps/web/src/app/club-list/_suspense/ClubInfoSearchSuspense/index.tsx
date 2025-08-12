import { withSuspense } from '@/_shared/helpers/hoc/withSuspense';
import { ClubInfoSearchClient } from '@/app/club-list/_clientBoundary/ClubInfoSearchClient';
import { getClubInfoSearch } from '@/data/club/getClubInfoSearch/fetch';

export const ClubInfoSearchSuspense = withSuspense(
  async () => {
    try {
      const data = await getClubInfoSearch({ name: '두잇', nameEn: 'doit' });

      return <ClubInfoSearchClient initialData={data} />;
    } catch (error) {
      console.error(error);
    }
  },
  { fallback: <span>로딩중...</span> },
);
