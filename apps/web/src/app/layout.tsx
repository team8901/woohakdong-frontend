import '@workspace/ui/globals.css';

import type { PropsWithChildren } from 'react';

import { ProviderClient } from '@/_shared/clientBoundary/ProviderClient';
import { InitEventTracker } from '@/eventTracker/InitEventTracker';
import { EnableMockClient } from '@/mock/browser';
import { initServerHeaders } from '@workspace/api';
import { Toaster } from '@workspace/ui/components/sonner';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { headers } from 'next/headers';

/**
 * 서버 컴포넌트에서 axios API 호출 시 쿠키를 자동으로 포함시키기 위해
 * Next.js의 headers 함수 참조를 등록합니다.
 *
 * 미들웨어에서 쿠키를 읽어 x-auth-cookies 헤더로 전달하고,
 * axios 인터셉터에서 이 헤더를 읽어 Cookie 헤더로 변환합니다.
 *
 * @see https://nextjs.org/docs/app/api-reference/functions/headers
 */
initServerHeaders(headers);

const pretendard = localFont({
  src: '../../../../packages/ui/src/fonts/pretendard/PretendardVariable.woff2',
  display: 'swap',
  weight: '100 900',
  variable: '--font-pretendard',
});

const jua = localFont({
  src: '../../../../packages/ui/src/fonts/jua/Jua-Regular.ttf',
  display: 'swap',
  weight: '400',
  variable: '--font-jua',
});

export const metadata: Metadata = {
  title: '우학동',
  description: '우학동 : 귀찮았던 동아리 관리, 우학동이 대신 해 드릴게요',
};

/**
 * 서버에서 렌더링된 HTML과 클라이언트에서의 초기 렌더링이 정확히 일치하지 않을 수 있는 경우,
 * 이를 방지하기 위해 suppressHydrationWarning을 사용합니다.
 * @see https://ui.shadcn.com/docs/dark-mode/next
 */
const RootLayout = ({ children }: PropsWithChildren) => {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={`${pretendard.variable} ${jua.variable} antialiased`}>
        <ProviderClient>
          <EnableMockClient />
          <InitEventTracker />
          <Toaster />
          {children}
        </ProviderClient>
      </body>
    </html>
  );
};

export default RootLayout;
