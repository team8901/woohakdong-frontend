import { type LucideIcon } from 'lucide-react';

export type DashboardHeaderData = {
  category: string;
  title: string;
};

export type UserAccount = {
  name: string;
  email: string;
  avatar?: string;
};

export type UserJoinedClub = {
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
  userAccountInfo: UserAccount;
  userJoinedClub: UserJoinedClub[];
  navigationMenus: NavigationMenu[];
};
