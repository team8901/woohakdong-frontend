import { type ClubMemberGender } from '@/app/(dashboard)/member/_helpers/constants/clubMemberGender';
import { type ClubMemberRole } from '@/app/(dashboard)/member/_helpers/constants/clubMemberRole';

/**
 * 동아리 회원 조회 request
 * @todo 동아리 회원 조회 API 스펙 확정되면 수정 필요
 */
export type ClubMembersRequest = {
  clubId: number;
};

/**
 * 동아리 회원 조회 response
 * @todo 동아리 회원 조회 API 스펙 확정되면 수정 필요
 */
export type ClubMembersResponse = {
  id: number;
  name: string;
  phoneNumber: string;
  email: string;
  gender: ClubMemberGender;
  major: string;
  studentNumber: string;
  role: ClubMemberRole;
  joinedDate: string;
};
