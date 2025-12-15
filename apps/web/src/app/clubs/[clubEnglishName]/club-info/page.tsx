import { ClubInfoHeader } from '@/app/clubs/[clubEnglishName]/club-info/_components/ClubInfoHeader';

import { ClubInfoFormSuspense } from './_suspense/ClubInfoFormSuspense';
import { QrCardSuspense } from './_suspense/QrCardSuspense';

/**
 * 동적 렌더링 강제 설정
 * - 서버에서 인증 필요한 API(getJoinedClubs)를 호출하므로 빌드 타임 정적 생성 방지
 * - 런타임에만 렌더링하여 실제 유저의 인증 정보로 데이터 fetch
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#dynamic
 */
export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ clubEnglishName: string }>;
};

const ClubInfoPage = async ({ params }: Props) => {
  return (
    <div className="space-y-6">
      <ClubInfoHeader />
      <ClubInfoFormSuspense params={params} />
      <QrCardSuspense params={params} />
    </div>
  );
};

export default ClubInfoPage;
