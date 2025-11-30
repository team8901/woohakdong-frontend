import { NAV_MENU } from '@/app/clubs/[clubEnglishName]/_helpers/constants';
import { getJoinedClubs, getMyProfile } from '@workspace/api/generated';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from '@workspace/ui/components/sidebar';

import { ClubSwitcherClient } from '../../_clientBoundary/ClubSwitcherClient';
import { NavClient } from '../../_clientBoundary/NavClient';
import { UserAccountClient } from '../../_clientBoundary/UserAccountClient';

export const DashboardSidebar = async ({
  ...props
}: React.ComponentProps<typeof Sidebar>) => {
  const [clubsResponse, user] = await Promise.all([
    getJoinedClubs(),
    getMyProfile(),
  ]);

  const clubs = clubsResponse.data ?? [];

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <ClubSwitcherClient clubs={clubs} />
      </SidebarHeader>

      <SidebarContent>
        <NavClient navMenus={NAV_MENU} />
      </SidebarContent>

      <SidebarFooter>
        <UserAccountClient user={user} />
      </SidebarFooter>
    </Sidebar>
  );
};
