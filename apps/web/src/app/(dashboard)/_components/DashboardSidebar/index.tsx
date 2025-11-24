import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from '@workspace/ui/components/sidebar';

import { ClubSwitcherClient } from '../../_clientBoundary/ClubSwitcherClient';
import { NavClient } from '../../_clientBoundary/NavClient';
import { UserAccountClient } from '../../_clientBoundary/UserAccountClient';
import { DASHBOARD_SIDEBAR_MAP } from '../../_helpers/constants';

export const DashboardSidebar = ({
  ...props
}: React.ComponentProps<typeof Sidebar>) => {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <ClubSwitcherClient clubs={DASHBOARD_SIDEBAR_MAP.userJoinedClubs} />
      </SidebarHeader>

      <SidebarContent>
        <NavClient navMenus={DASHBOARD_SIDEBAR_MAP.navMenus} />
      </SidebarContent>

      <SidebarFooter>
        <UserAccountClient user={DASHBOARD_SIDEBAR_MAP.userAccountInfo} />
      </SidebarFooter>
    </Sidebar>
  );
};
