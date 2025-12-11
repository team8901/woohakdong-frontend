'use client';

import { useEffect, useState } from 'react';

import { buildUrlWithParams } from '@/_shared/helpers/utils/buildUrlWithParams';
import { getCookieValue } from '@/_shared/helpers/utils/getCookieValue';
import { CLUB_MEMBER_ROLE } from '@/app/clubs/[clubEnglishName]/member/_helpers/constants/clubMemberRole';
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
  const [isPresident, setIsPresident] = useState(false);

  useEffect(() => {
    const clubMemberRole = getCookieValue('clubMemberRole');

    setIsPresident(clubMemberRole === CLUB_MEMBER_ROLE.회장);
  }, []);

  return (
    <div>
      {navMenus.map((navMenu) => {
        const visibleSubCategories = navMenu.subCategories.filter(
          (subCategory) => !subCategory.presidentOnly || isPresident,
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
