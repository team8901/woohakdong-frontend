import '@workspace/ui/globals.css';

import { ThemeProviderClient } from '@/_shared/clientBoundary/ThemeProviderClient';
import { QueryClientProvider } from '@tanstack/react-query';
import { getQueryClient } from '@workspace/react-query/queryClient';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

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

const queryClient = getQueryClient();

/**
 * 서버에서 렌더링된 HTML과 클라이언트에서의 초기 렌더링이 정확히 일치하지 않을 수 있는 경우, 이를 방지하기 위해 suppressHydrationWarning을 사용
 * @see https://ui.shadcn.com/docs/dark-mode/next
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={`${pretendard.variable} ${jua.variable} antialiased`}>
        <ThemeProviderClient>
          <QueryClientProvider client={queryClient}>
            {children}
            <ReactQueryDevtools />
          </QueryClientProvider>
        </ThemeProviderClient>
      </body>
    </html>
  );
}
