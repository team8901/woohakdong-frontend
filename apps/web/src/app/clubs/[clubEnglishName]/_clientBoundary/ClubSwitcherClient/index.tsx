'use client';

import React from 'react';

import { APP_PATH } from '@/_shared/helpers/constants/appPath';
import { buildUrlWithParams } from '@/_shared/helpers/utils/buildUrlWithParams';
import { type ClubInfoResponse } from '@workspace/api/generated';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@workspace/ui/components/sidebar';
import { ChevronsUpDown, Plus } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export const ClubSwitcherClient = ({
  clubs,
}: {
  clubs: ClubInfoResponse[];
}) => {
  const { isMobile } = useSidebar();
  const [activeClub, setActiveClub] = React.useState(clubs[0]);
  const router = useRouter();

  if (!activeClub) {
    return null;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center overflow-hidden rounded-lg">
                {activeClub.bannerImageUrl ? (
                  <Image
                    src={activeClub.bannerImageUrl}
                    alt={activeClub.name ?? ''}
                    width={32}
                    height={32}
                    className="size-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-semibold">
                    {activeClub.name?.charAt(0)}
                  </span>
                )}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{activeClub.name}</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}>
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              동아리 목록
            </DropdownMenuLabel>
            {clubs.map((club) => (
              <DropdownMenuItem
                key={club.id}
                onClick={() => {
                  setActiveClub(club);
                  router.push(
                    buildUrlWithParams({
                      url: APP_PATH.CLUBS.HOME,
                      pathParams: { clubEnglishName: club.nameEn! },
                    }),
                  );
                }}
                className="gap-2 p-2">
                <div className="bg-muted flex size-6 items-center justify-center overflow-hidden rounded-md border">
                  {club.bannerImageUrl ? (
                    <Image
                      src={club.bannerImageUrl}
                      alt={club.name ?? ''}
                      width={24}
                      height={24}
                      className="size-full object-cover"
                    />
                  ) : (
                    <span className="text-xs font-medium">
                      {club.name?.charAt(0)}
                    </span>
                  )}
                </div>
                {club.name}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => router.push(APP_PATH.REGISTER_CLUB.HOME)}
              className="gap-2 p-2">
              <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                <Plus className="size-4" />
              </div>
              <div className="text-muted-foreground font-medium">
                동아리 등록하기
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};
