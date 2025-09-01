'use client';

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
} from '@workspace/ui/components/sidebar';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { NAV_MENU_ICONS } from '../../_helpers/constants';
import { useMobileSidebarClose } from '../../_helpers/hooks/useMobileSidebarClose';
import { type NavMenu } from '../../_helpers/types';

export const NavClient = ({ navMenus }: { navMenus: NavMenu[] }) => {
  const { handleMenuClick } = useMobileSidebarClose();
  const pathname = usePathname();

  return (
    <div>
      {navMenus.map((navMenu) => (
        <SidebarGroup key={navMenu.category}>
          <SidebarGroupLabel>{navMenu.category}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navMenu.subCategories.map((subCategory) => {
                const isActive = pathname === subCategory.url;
                const NavMenuIcon =
                  NAV_MENU_ICONS[
                    subCategory.icon as keyof typeof NAV_MENU_ICONS
                  ];

                return (
                  <SidebarMenuButton
                    asChild
                    key={subCategory.url}
                    isActive={isActive}
                    tooltip={subCategory.title}>
                    <Link href={subCategory.url} onClick={handleMenuClick}>
                      <NavMenuIcon />
                      {subCategory.title}
                    </Link>
                  </SidebarMenuButton>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </div>
  );
};
