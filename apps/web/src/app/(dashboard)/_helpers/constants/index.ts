import {
  Calendar,
  ClipboardClock,
  ClipboardList,
  Info,
  Megaphone,
  NotebookPen,
  UsersRound,
} from 'lucide-react';

import { type DashboardSidebarData, type PathData } from '../types';

export const NAV_MENU_ICONS = {
  Megaphone,
  NotebookPen,
  Calendar,
  UsersRound,
  ClipboardList,
  ClipboardClock,
  Info,
} as const;

export const DASHBOARD_BREADCRUMB_MAP: Record<string, PathData> = {
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

// TODO: 현재 하드코딩 된 상태
export const DASHBOARD_SIDEBAR_MAP: DashboardSidebarData = {
  userJoinedClubs: [
    // TODO: 동아리 정보 가져와서 넣어야 함
    {
      id: 1,
      name: 'Do-IT!',
    },
    {
      id: 2,
      name: '우학동',
    },
    {
      id: 3,
      name: '볼랜드',
    },
  ],
  navMenus: [
    {
      category: '소식',
      subCategories: [
        {
          title: '공지사항',
          icon: 'Megaphone',
          url: '/notice',
        },
        {
          title: '활동 기록',
          icon: 'NotebookPen',
          url: '/activity',
        },
        {
          title: '일정',
          icon: 'Calendar',
          url: '/schedule',
        },
      ],
    },
    {
      category: '관리',
      subCategories: [
        {
          title: '회원',
          icon: 'UsersRound',
          url: '/member',
        },
        {
          title: '물품',
          icon: 'ClipboardList',
          url: '/item',
        },
        {
          title: '물품 대여 내역',
          icon: 'ClipboardClock',
          url: '/item-history',
        },
      ],
    },
    {
      category: '정보',
      subCategories: [
        {
          title: '동아리 정보',
          icon: 'Info',
          url: '/club-info',
        },
      ],
    },
  ],
  userAccountInfo: {
    name: '강동우',
    email: 'alsdn1360@ajou.ac.kr',
  },
};
