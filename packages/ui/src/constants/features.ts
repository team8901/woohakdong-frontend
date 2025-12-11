import { FileText, QrCode, Search, Users } from 'lucide-react';

export const MEMBER_FEATURES = [
  {
    icon: Users,
    title: '회원 목록 관리',
    description: '한눈에 보는 전체 회원 현황',
  },
  {
    icon: Search,
    title: '회원 검색',
    description: '이름, 학번으로 빠른 검색',
  },
  {
    icon: FileText,
    title: '가입 신청서',
    description: '맞춤형 신청서로 간편 가입',
  },
  {
    icon: QrCode,
    title: 'QR 코드 가입',
    description: 'QR 스캔으로 즉시 가입',
  },
] as const;

export type MemberFeature = (typeof MEMBER_FEATURES)[number];
