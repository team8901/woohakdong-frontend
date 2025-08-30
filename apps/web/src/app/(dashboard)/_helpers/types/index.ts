import { type LucideIcon } from 'lucide-react';

export type PathData = {
  category: string;
  title: string;
};

export type UserAccountInfo = {
  name: string;
  email: string;
  avatar?: string;
};

export type UserJoinedClub = {
  id: number;
  name: string;
  logo: LucideIcon;
};

export type SubCategory = {
  title: string;
  icon: LucideIcon;
  url: string;
};

export type NavigationMenu = {
  category: string;
  subCategories: SubCategory[];
};

export type DashboardSidebarData = {
  userJoinedClubs: UserJoinedClub[];
  navigationMenus: NavigationMenu[];
  userAccountInfo: UserAccountInfo;
};
