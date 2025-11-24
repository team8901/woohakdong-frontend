export type RegisterProfileRequest = {
  nickname: string;
  phoneNumber: string;
  studentId: string;
  major: string;
  gender: string;
};

export type RegisterProfileResponse = {
  userProfileId: number;
};
