import type { PropsWithChildren } from 'react';

import {
  SidebarInset,
  SidebarProvider,
} from '@workspace/ui/components/sidebar';
import { cookies } from 'next/headers';

import { ClubRoleInitializer } from './_clientBoundary/ClubRoleInitializer';
import { DashboardHeader } from './_components/DashboardHeader';
import { DashboardSidebar } from './_components/DashboardSidebar';

const DashboardLayout = async ({ children }: PropsWithChildren) => {
  // 새로고침해도 사이드바 상태를 유지하기 위해 쿠키에서 값을 가져옴
  const cookieStore = await cookies();
  const sidebarCookie = cookieStore.get('sidebar_state')?.value;
  const isDefaultOpen = sidebarCookie === undefined || sidebarCookie === 'true';

  return (
    <div className="flex min-h-screen w-screen overflow-x-hidden">
      <ClubRoleInitializer />
      <SidebarProvider defaultOpen={isDefaultOpen}>
        <DashboardSidebar />
        <SidebarInset className="min-w-0 overflow-hidden">
          <DashboardHeader />
          <div className="flex min-w-0 flex-1 flex-col overflow-x-auto p-5 md:p-8">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
};

export default DashboardLayout;
