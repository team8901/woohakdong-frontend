import '@workspace/ui/globals.css';

import { InitEventTracker } from '@/eventTracker/InitEventTracker';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { ThemeProvider } from 'next-themes';

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
  title: '우학동 : 우리 학교 동아리',
  description: '우학동 랜딩 페이지',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={`${pretendard.variable} ${jua.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <InitEventTracker />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
