import {
  AudioWaveform,
  Calendar,
  ClipboardClock,
  ClipboardList,
  Command,
  GalleryVerticalEnd,
  Info,
  Megaphone,
  NotebookPen,
  UsersRound,
} from 'lucide-react';

import { type DashboardHeaderData, type DashboardSidebarData } from '../types';

export const DASHBOARD_HEADER_MAP: Record<string, DashboardHeaderData> = {
  '/notice': {
    category: '소식',
    title: '공지사항',
  },
  '/activity': {
    category: '소식',
    title: '활동 기록',
  },
  '/schedule': {
    category: '소식',
    title: '일정',
  },
  '/member': {
    category: '관리',
    title: '회원',
  },
  '/item': {
    category: '관리',
    title: '물품',
  },
  '/item-history': {
    category: '관리',
    title: '물품 대여 내역',
  },
  '/club-info': {
    category: '정보',
    title: '동아리 정보',
  },
};

export const DASHBOARD_SIDEBAR_MAP: DashboardSidebarData = {
  userAccountInfo: {
    name: '강동우',
    email: 'alsdn1360@ajou.ac.kr',
    // avatar: '/avatars/shadcn.jpg', TODO: 주석 제거 해야 함
  },
  userJoinedClub: [
    // TODO: 동아리 정보 가져와서 넣어야 함
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
  navigationMenus: [
    {
      category: '소식',
      subCategories: [
        {
          title: '공지사항',
          icon: Megaphone,
          url: '/notice',
        },
        {
          title: '활동 기록',
          icon: NotebookPen,
          url: '/activity',
        },
        {
          title: '일정',
          icon: Calendar,
          url: '/schedule',
        },
      ],
    },
    {
      category: '관리',
      subCategories: [
        {
          title: '회원',
          icon: UsersRound,
          url: '/member',
        },
        {
          title: '물품',
          icon: ClipboardList,
          url: '/item',
        },
        {
          title: '물품 대여 내역',
          icon: ClipboardClock,
          url: '/item-history',
        },
      ],
    },
    {
      category: '정보',
      subCategories: [
        {
          title: '동아리 정보',
          icon: Info,
          url: '/club-info',
        },
      ],
    },
  ],
};
