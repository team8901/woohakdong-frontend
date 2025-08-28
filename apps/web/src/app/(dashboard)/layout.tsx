import {
  SidebarInset,
  SidebarProvider,
} from '@workspace/ui/components/sidebar';

import { DashboardHeaderClient } from './_clientBoundary/DashboardHeaderClient';
import { DashboardSidebarClient } from './_clientBoundary/DashboardSidebarClient';

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
          <DashboardHeaderClient />
          <main className="flex-1 p-5 pt-0">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
