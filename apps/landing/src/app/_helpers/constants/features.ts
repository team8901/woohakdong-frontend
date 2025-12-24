import {
  Calendar,
  type LucideIcon,
  MessageSquare,
  Package,
  UserPlus,
  Users,
} from 'lucide-react';

export type FeatureOverview = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export const FEATURES_OVERVIEW: FeatureOverview[] = [
  {
    icon: UserPlus,
    title: '등록',
    description: '5분 만에 동아리 등록',
  },
  {
    icon: Users,
    title: '회원',
    description: '엑셀 없는 회원 관리',
  },
  {
    icon: Package,
    title: '물품',
    description: '대여 현황 실시간 추적',
  },
  {
    icon: Calendar,
    title: '일정',
    description: '공유 캘린더로 일정 관리',
  },
  {
    icon: MessageSquare,
    title: '소통',
    description: '공지사항 한 곳에서',
  },
];
