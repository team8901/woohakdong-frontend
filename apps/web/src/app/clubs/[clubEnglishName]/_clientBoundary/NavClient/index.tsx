'use client';

import { useIsEditable } from '@/_shared/helpers/hooks/useIsEditable';
import { buildUrlWithParams } from '@/_shared/helpers/utils/buildUrlWithParams';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
} from '@workspace/ui/components/sidebar';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';

import { NAV_MENU_ICONS } from '../../_helpers/constants';
import { useMobileSidebarClose } from '../../_helpers/hooks/useMobileSidebarClose';
import { type NavMenu } from '../../_helpers/types';

export const NavClient = ({ navMenus }: { navMenus: NavMenu[] }) => {
  const { handleMenuClick } = useMobileSidebarClose();
  const { clubEnglishName } = useParams<{ clubEnglishName: string }>();
  const pathname = usePathname();
  const isEditable = useIsEditable();

  return (
    <div>
      {navMenus.map((navMenu) => {
        const visibleSubCategories = navMenu.subCategories.filter(
          (subCategory) => !subCategory.presidentOnly || isEditable,
        );

        if (visibleSubCategories.length === 0) return null;

        return (
          <SidebarGroup key={navMenu.category}>
            <SidebarGroupLabel>{navMenu.category}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {visibleSubCategories.map((subCategory) => {
                  const clubUrl = buildUrlWithParams({
                    url: subCategory.url,
                    pathParams: { clubEnglishName },
                  });
                  const isActive = pathname === clubUrl;
                  const NavMenuIcon =
                    NAV_MENU_ICONS[
                      subCategory.icon as keyof typeof NAV_MENU_ICONS
                    ];

                  return (
                    <SidebarMenuButton
                      asChild
                      key={clubUrl}
                      isActive={isActive}
                      tooltip={subCategory.title}>
                      <Link href={clubUrl} onClick={handleMenuClick}>
                        <NavMenuIcon />
                        {subCategory.title}
                      </Link>
                    </SidebarMenuButton>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        );
      })}
    </div>
  );
};
