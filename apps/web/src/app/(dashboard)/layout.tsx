import {
  SidebarInset,
  SidebarProvider,
} from '@workspace/ui/components/sidebar';
import { cookies } from 'next/headers';

import { DashboardSidebarClient } from './_clientBoundary/DashboardSidebarClient';
import { DashboardHeader } from './_components/DashboardHeader';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 새로고침해도 사이드바 상태를 유지하기 위해 쿠키에서 값을 가져옴
  const cookieStore = await cookies();
  const sidebarCookie = cookieStore.get('sidebar_state')?.value;
  const defaultOpen =
    sidebarCookie === undefined ? true : sidebarCookie === 'true';

  return (
    <div className="flex min-h-screen w-screen">
      <SidebarProvider defaultOpen={defaultOpen}>
        <DashboardSidebarClient />
        <SidebarInset>
          <DashboardHeader />
          <main className="flex-1 p-5 pt-0">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
