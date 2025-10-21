'use client'; // NOTE: Error boundaries must be Client Components

import { Button } from '@workspace/ui/components/button';
import { RefreshCcwIcon, SirenIcon } from 'lucide-react';

const SUPPORT_MAIL = '8901.dev@gmail.com';

/**
 * web 서비스의 global error 를 핸들링하는 Error boundary
 * @see https://nextjs.org/docs/app/getting-started/error-handling
 */
const GlobalError = () => {
  return (
    // NOTE: global-error must include html and body tags
    <html lang="ko">
      <body className="bg-background flex min-h-screen w-screen flex-col items-center justify-center gap-6 p-6">
        <div className="flex max-w-lg flex-col items-center justify-center gap-6">
          <SirenIcon className="text-destructive mx-auto size-16" />
          <h1 className="text-center text-5xl font-bold">Ooops!</h1>
          <p className="text-center text-xl font-semibold">
            문제가 발생했습니다
          </p>
          <p className="text-muted-foreground text-center text-sm leading-relaxed">
            페이지를 새로고침 하거나 잠시 후 다시 시도해 주세요.
          </p>
          <Button
            variant="outline"
            size="lg"
            className="max-w-3xs w-full"
            onClick={() => {
              window.location.reload();
            }}>
            <RefreshCcwIcon />
            다시 시도하기
          </Button>
          <div className="flex flex-col justify-center">
            <p className="text-muted-foreground mx-auto text-center text-sm leading-relaxed">
              문제가 계속된다면, 아래의 이메일로 문의해 주시면 빠르게 해결해
              드릴게요!
            </p>
            <Button variant="link" className="text-muted-foreground" asChild>
              <a href={`mailto:${SUPPORT_MAIL}`}>{SUPPORT_MAIL}</a>
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
};

export default GlobalError;
