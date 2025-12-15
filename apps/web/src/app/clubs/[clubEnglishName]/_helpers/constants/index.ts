import { APP_PATH } from '@/_shared/helpers/constants/appPath';
import {
  Calendar,
  ClipboardClock,
  ClipboardList,
  FileText,
  Info,
  Megaphone,
  NotebookPen,
  UsersRound,
} from 'lucide-react';

import { type PathData } from '../types';

export const NAV_MENU_ICONS = {
  Megaphone,
  NotebookPen,
  Calendar,
  UsersRound,
  ClipboardList,
  ClipboardClock,
  Info,
  FileText,
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
  '/application-form': {
    category: '관리',
    title: '가입 신청서',
  },
  '/club-info': {
    category: '정보',
    title: '동아리 정보',
  },
};

export const NAV_MENU = [
  {
    category: '소식',
    subCategories: [
      {
        title: '공지사항',
        icon: 'Megaphone',
        url: APP_PATH.CLUBS.NOTICE,
      },
      {
        title: '활동 기록',
        icon: 'NotebookPen',
        url: APP_PATH.CLUBS.ACTIVITY,
      },
      {
        title: '일정',
        icon: 'Calendar',
        url: APP_PATH.CLUBS.SCHEDULE,
      },
    ],
  },
  {
    category: '관리',
    subCategories: [
      {
        title: '회원',
        icon: 'UsersRound',
        url: APP_PATH.CLUBS.MEMBER,
      },
      {
        title: '물품',
        icon: 'ClipboardList',
        url: APP_PATH.CLUBS.ITEM,
      },
      {
        title: '물품 대여 내역',
        icon: 'ClipboardClock',
        url: APP_PATH.CLUBS.ITEM_HISTORY,
      },
      {
        title: '가입 신청서',
        icon: 'FileText',
        url: APP_PATH.CLUBS.APPLICATION_FORM,
        presidentOnly: true,
      },
    ],
  },
  {
    category: '정보',
    subCategories: [
      {
        title: '동아리 정보',
        icon: 'Info',
        url: APP_PATH.CLUBS.CLUB_INFO,
      },
    ],
  },
];
