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
import {
  AudioWaveform,
  Calendar,
  ClipboardClock,
  ClipboardList,
  Command,
  GalleryVerticalEnd,
  Globe,
  Info,
  Megaphone,
  NotebookPen,
  UsersRound,
} from 'lucide-react';

import { ClubSwitcher } from '../../_components/ClubSwitcher';
import { UserAccountInfo } from '../../_components/UserAccountInfo';

export const data = {
  user: {
    name: '강동우',
    email: 'alsdn1360@ajou.ac.kr',
    // avatar: '/avatars/shadcn.jpg', TODO: 주석 제거 해야 함
  },
  clubs: [
    {
      name: 'Do-IT!',
      logo: GalleryVerticalEnd,
    },
    {
      name: '우학동',
      logo: AudioWaveform,
    },
    {
      name: '볼랜드',
      logo: Command,
    },
  ],
  navMain: [
    {
      title: '소식',
      url: '#',
      menus: [
        {
          title: '공지사항',
          icon: Megaphone,
          url: '#',
        },
        {
          title: '활동 기록',
          icon: NotebookPen,
          url: '#',
        },
        {
          title: '일정',
          icon: Calendar,
          url: '#',
        },
      ],
    },
    {
      title: '관리',
      url: '#',
      menus: [
        {
          title: '회원',
          icon: UsersRound,
          url: '#',
        },
        {
          title: '물품',
          icon: ClipboardList,
          url: '#',
        },
        {
          title: '물품 대여 내역',
          icon: ClipboardClock,
          url: '#',
        },
      ],
    },
    {
      title: '정보',
      url: '#',
      menus: [
        {
          title: '동아리 정보',
          icon: Info,
          url: '#',
        },
        {
          title: '홍보 프로필',
          icon: Globe,
          url: '#',
        },
      ],
    },
  ],
};

export const DashboardSidebarClient = ({
  ...props
}: React.ComponentProps<typeof Sidebar>) => {
  return (
    <Sidebar variant="inset" collapsible="icon" {...props}>
      <SidebarHeader>
        <ClubSwitcher teams={data.clubs} />
      </SidebarHeader>
      <SidebarContent>
        {data.navMain.map((item) => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.menus.map((menu) => (
                  <SidebarMenuButton
                    asChild
                    key={menu.title}
                    tooltip={menu.title}>
                    <a href={menu.url}>
                      {menu.icon && <menu.icon />}
                      {menu.title}
                    </a>
                  </SidebarMenuButton>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <UserAccountInfo user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
};
