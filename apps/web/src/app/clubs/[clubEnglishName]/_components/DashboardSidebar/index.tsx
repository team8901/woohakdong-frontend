import { ServerErrorFallback } from '@/_shared/components/ServerErrorFallback';
import { NAV_MENU } from '@/app/clubs/[clubEnglishName]/_helpers/constants';
import { withServerCookies } from '@workspace/api';
import { getJoinedClubs, getMyProfile } from '@workspace/api/generated';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from '@workspace/ui/components/sidebar';
import { cookies } from 'next/headers';

import { ClubSwitcherClient } from '../../_clientBoundary/ClubSwitcherClient';
import { NavClient } from '../../_clientBoundary/NavClient';
import { UserAccountClient } from '../../_clientBoundary/UserAccountClient';

export const DashboardSidebar = async ({
  ...props
}: React.ComponentProps<typeof Sidebar>) => {
  try {
    const { clubs, user } = await withServerCookies(cookies, async () => {
      const [clubsResponse, userResponse] = await Promise.all([
        getJoinedClubs(),
        getMyProfile(),
      ]);

      return {
        clubs: clubsResponse.data ?? [],
        user: userResponse,
      };
    });

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
  } catch (error) {
    console.error('DashboardSidebar', error);

    return <ServerErrorFallback message="사이드바를 불러오지 못했어요" />;
  }
};
