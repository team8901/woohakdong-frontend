'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
} from '@workspace/ui/components/sidebar';
import Link from 'next/link';

import { ClubSwitcher } from '../../_components/ClubSwitcher';
import { UserAccount } from '../../_components/UserAccount';
import { DASHBOARD_SIDEBAR_MAP } from '../../_helpers/constants';

export const DashboardSidebarClient = ({
  ...props
}: React.ComponentProps<typeof Sidebar>) => {
  return (
    <Sidebar variant="inset" collapsible="icon" {...props}>
      <SidebarHeader>
        <ClubSwitcher teams={DASHBOARD_SIDEBAR_MAP.userJoinedClub} />
      </SidebarHeader>
      <SidebarContent>
        {DASHBOARD_SIDEBAR_MAP.navigationMenus.map((navigationMenu) => (
          <SidebarGroup key={navigationMenu.category}>
            <SidebarGroupLabel>{navigationMenu.category}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationMenu.subCategories.map((subCategory) => (
                  <SidebarMenuButton
                    asChild
                    key={subCategory.title}
                    tooltip={subCategory.title}>
                    <Link href={subCategory.url}>
                      <subCategory.icon />
                      {subCategory.title}
                    </Link>
                  </SidebarMenuButton>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <UserAccount user={DASHBOARD_SIDEBAR_MAP.userAccountInfo} />
      </SidebarFooter>
    </Sidebar>
  );
};
