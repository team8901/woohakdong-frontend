import { Button } from '@workspace/ui/components/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import { AlertCircle } from 'lucide-react';
import { type Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '카드 등록 실패 | 우학동',
  description: '카드 등록에 실패했습니다.',
};

type CardRegisterFailPageProps = {
  searchParams: Promise<{
    code?: string;
    message?: string;
    clubEnglishName?: string;
  }>;
};

const CardRegisterFailPage = async ({
  searchParams,
}: CardRegisterFailPageProps) => {
  const params = await searchParams;
  const redirectUrl = params.clubEnglishName
    ? `/clubs/${params.clubEnglishName}/billing`
    : '/club-list';

  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <AlertCircle className="mx-auto mb-4 size-16 text-red-500" />
          <CardTitle className="text-xl text-red-500">카드 등록 실패</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-muted-foreground">
            {params.message ?? '카드 등록 중 오류가 발생했습니다.'}
          </p>
          {params.code && (
            <p className="text-muted-foreground text-sm">
              오류 코드: {params.code}
            </p>
          )}
          <Button asChild className="w-full">
            <Link href={redirectUrl}>돌아가기</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default CardRegisterFailPage;
