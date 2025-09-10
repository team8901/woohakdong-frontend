export type RegisterMyProfileRequest = {
  nickname: string;
  phoneNumber: string;
  studentId: string;
  gender: string;
};

export type RegisterMyProfileResponse = {
  userProfileId: number;
};
