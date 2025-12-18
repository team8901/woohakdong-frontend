import { type Metadata } from 'next';

import { CardRegisterSuccessClient } from './_clientBoundary/CardRegisterSuccessClient';

export const metadata: Metadata = {
  title: '카드 등록 완료 | 우학동',
  description: '카드가 등록되었습니다.',
};

type CardRegisterSuccessPageProps = {
  searchParams: Promise<{
    authKey?: string;
    customerKey?: string;
    clubId?: string;
    clubEnglishName?: string;
  }>;
};

const CardRegisterSuccessPage = async ({ searchParams }: CardRegisterSuccessPageProps) => {
  const params = await searchParams;

  return (
    <CardRegisterSuccessClient
      authKey={params.authKey}
      customerKey={params.customerKey}
      clubId={params.clubId ? Number(params.clubId) : undefined}
      clubEnglishName={params.clubEnglishName}
    />
  );
};

export default CardRegisterSuccessPage;
