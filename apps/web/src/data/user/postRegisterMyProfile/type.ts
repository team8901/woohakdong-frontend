export type RegsiterMyProfileRequest = {
  nickname: string;
  phoneNumber: string;
  studentId: string;
  gender: string;
};

export type RegsiterMyProfileResponse = {
  userProfileId: number;
};
