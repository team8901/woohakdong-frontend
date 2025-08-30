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

import { useMobileSidebarClose } from '../../_helpers/hooks/useMobileSidebarClose';
import { type NavigationMenu } from '../../_helpers/types';

export const SidebarNavigationClient = ({
  navigationMenus,
}: {
  navigationMenus: NavigationMenu[];
}) => {
  const { handleMenuClick } = useMobileSidebarClose();
  const pathname = usePathname();

  return (
    <div>
      {navigationMenus.map((navigationMenu) => (
        <SidebarGroup key={navigationMenu.category}>
          <SidebarGroupLabel>{navigationMenu.category}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationMenu.subCategories.map((subCategory) => {
                const isActive = pathname === subCategory.url;

                return (
                  <SidebarMenuButton
                    asChild
                    key={subCategory.url}
                    isActive={isActive}
                    tooltip={subCategory.title}>
                    <Link href={subCategory.url} onClick={handleMenuClick}>
                      <subCategory.icon />
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
