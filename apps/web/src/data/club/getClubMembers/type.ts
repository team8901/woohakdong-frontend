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
  clubMembershipId: number;
  nickname: string;
  clubMemberRole: ClubMemberRole;
  clubJoinDate: string;
  name: string;
  email: string;
  phoneNumber: string;
  studentId: string;
  major: string;
  gender: ClubMemberGender;
};
