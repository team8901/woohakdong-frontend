import { Separator } from '@workspace/ui/components/separator';
import { SidebarTrigger } from '@workspace/ui/components/sidebar';

import { BreadcrumbClient } from '../../_clientBoundary/BreadcrumbClient';

export const DashboardHeader = () => {
  return (
    <header className="bg-background group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        <BreadcrumbClient />
      </div>
    </header>
  );
};
