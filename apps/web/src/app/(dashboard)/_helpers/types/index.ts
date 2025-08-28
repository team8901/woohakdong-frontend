import { type LucideIcon } from 'lucide-react';

export type DashboardHeaderData = {
  category: string;
  title: string;
};

export type UserAccountInfo = {
  name: string;
  email: string;
  avatar?: string;
};

export type UserJoinedClubs = {
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
  userAccountInfo: UserAccountInfo;
  userJoinedClubs: UserJoinedClubs[];
  navigationMenus: NavigationMenu[];
};
