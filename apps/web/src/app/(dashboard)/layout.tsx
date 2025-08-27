import {
  SidebarInset,
  SidebarProvider,
} from '@workspace/ui/components/sidebar';

import { DashboardSidebarClient } from './_clientBoundary/DashboardSidebarClient';
import { DashboardHeader } from './_components/DashboardHeader';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-screen">
      <SidebarProvider>
        <DashboardSidebarClient />
        <SidebarInset>
          <DashboardHeader />
          <main className="flex-1 p-5 pt-0">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
