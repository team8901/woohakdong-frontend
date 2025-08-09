import '@workspace/ui/globals.css';

import { Providers } from '@/_shared/components/providers';
import type { Metadata } from 'next';
import localFont from 'next/font/local';

const pretendard = localFont({
  src: '../../../../packages/ui/src/fonts/pretendard/PretendardVariable.woff2',
  display: 'swap',
  weight: '100 900',
  variable: '--font-pretendard',
});

export const metadata: Metadata = {
  title: '우학동',
  description: '우학동 : 귀찮았던 동아리 관리, 우학동이 대신 해 드릴게요',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={`${pretendard.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
