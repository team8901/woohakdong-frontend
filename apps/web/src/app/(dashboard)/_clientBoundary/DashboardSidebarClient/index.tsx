'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from '@workspace/ui/components/sidebar';

import { DASHBOARD_SIDEBAR_MAP } from '../../_helpers/constants';
import { ClubSwitcherClient } from '../ClubSwitcherClient';
import { SidebarNavigationClient } from '../SidebarNavigationClient';
import { UserAccountClient } from '../UserAccountClient';

export const DashboardSidebarClient = ({
  ...props
}: React.ComponentProps<typeof Sidebar>) => {
  return (
    <Sidebar variant="inset" collapsible="icon" {...props}>
      <SidebarHeader>
        <ClubSwitcherClient clubs={DASHBOARD_SIDEBAR_MAP.userJoinedClubs} />
      </SidebarHeader>

      <SidebarContent>
        <SidebarNavigationClient
          navigationMenus={DASHBOARD_SIDEBAR_MAP.navigationMenus}
        />
      </SidebarContent>

      <SidebarFooter>
        <UserAccountClient user={DASHBOARD_SIDEBAR_MAP.userAccountInfo} />
      </SidebarFooter>
    </Sidebar>
  );
};
