export type PathData = {
  category: string;
  title: string;
};

export type UserJoinedClub = {
  id: number;
  name: string;
  logo?: string; // TODO: 동아리 로고 이미지로 변경해야 함
};

export type SubCategory = {
  title: string;
  icon: string;
  url: string;
};

export type NavMenu = {
  category: string;
  subCategories: SubCategory[];
};

export type UserAccountInfo = {
  name: string;
  email: string;
  avatar?: string; // TODO: 회원 프로필 이미지로 변경해야 함
};

export type DashboardSidebarData = {
  userJoinedClubs: UserJoinedClub[];
  navMenus: NavMenu[];
  userAccountInfo: UserAccountInfo;
};
