import {
  SidebarInset,
  SidebarProvider,
} from '@workspace/ui/components/sidebar';
import { cookies } from 'next/headers';

import { DashboardHeader } from './_components/DashboardHeader';
import { DashboardSidebar } from './_components/DashboardSidebar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 새로고침해도 사이드바 상태를 유지하기 위해 쿠키에서 값을 가져옴
  const cookieStore = await cookies();
  const sidebarCookie = cookieStore.get('sidebar_state')?.value;
  const isDefaultOpen = sidebarCookie === undefined || sidebarCookie === 'true';

  return (
    <div className="flex min-h-screen w-screen">
      <SidebarProvider defaultOpen={isDefaultOpen}>
        <DashboardSidebar />
        <SidebarInset>
          <DashboardHeader />
          <main className="flex-1 p-5 pt-0">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
