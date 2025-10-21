'use client';

import { Button } from '@workspace/ui/components/button';
import { ArrowLeftIcon, HomeIcon, SearchXIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

/**
 * 404 Not Found 페이지
 * 존재하지 않는 경로로 접근했을 때 표시되는 커스텀 페이지
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/not-found
 */
const NotFound = () => {
  const router = useRouter();

  return (
    <div className="bg-background flex min-h-screen w-screen flex-col items-center justify-center gap-6 p-6">
      <div className="flex max-w-lg flex-col items-center justify-center gap-6">
        <SearchXIcon className="mx-auto size-16" />
        <h1 className="text-center text-5xl font-bold">404</h1>
        <p className="text-center text-xl font-semibold">
          페이지를 찾을 수 없습니다
        </p>
        <p className="text-muted-foreground text-center text-sm leading-relaxed">
          요청하신 페이지가 존재하지 않거나 삭제되었을 수 있습니다.
          <br />
          URL을 다시 확인하거나 아래 버튼을 이용해 주세요.
        </p>
        <div className="flex w-full max-w-sm flex-col gap-3">
          <Button variant="outline" size="lg" className="w-full" asChild>
            <Link href={process.env.NEXT_PUBLIC_APP_URL || '/'}>
              <HomeIcon />
              홈으로 돌아가기
            </Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={() => router.back()}>
            <ArrowLeftIcon />
            뒤로가기
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
