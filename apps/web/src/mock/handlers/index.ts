import { mockPostSocialLogin } from '@/mock/handlers/auth/postSocialLogin/mockPostSocialLogin';
import { mockDeleteClubNotice } from '@/mock/handlers/club/deleteClubNotice/mockDeleteClubNotice';
import { mockGetClubInfoSearch } from '@/mock/handlers/club/getClubInfoSearch/mockGetClubInfoSearch';
import { mockGetClubItemHistory } from '@/mock/handlers/club/getClubItemHistory/mockGetClubItemHistory';
import { mockGetClubItems } from '@/mock/handlers/club/getClubItems/mockGetClubItems';
import { mockGetClubMembers } from '@/mock/handlers/club/getClubMembers/mockGetClubMembers';
import { mockGetClubNotice } from '@/mock/handlers/club/getClubNotice/mockGetClubNotice';
import { mockGetClubNotices } from '@/mock/handlers/club/getClubNotices/mockGetClubNotices';
import { mockGetJoinedClubs } from '@/mock/handlers/club/getJoinedClubs/mockGetJoinedClubs';
import { mockPostAddClubItem } from '@/mock/handlers/club/postAddClubItem/mockPostAddClubItem';
import { mockPostClubNotice } from '@/mock/handlers/club/postClubNotice/mockPostClubNotice';
import { mockPostRegisterClub } from '@/mock/handlers/club/postRegisterClub/mockPostRegisterClub';
import { mockPostRentClubItem } from '@/mock/handlers/club/postRentClubItem/mockPostRentClubItem';
import { mockPutClubInfo } from '@/mock/handlers/club/putClubInfo/mockPutClubInfo';
import { mockPutClubNotice } from '@/mock/handlers/club/putClubNotice/mockPutClubNotice';
import { mockGetMyProfile } from '@/mock/handlers/user-profile/getMyProfile/mockGetMyProfile';
import { mockGetS3ImageUrl } from '@/mock/handlers/util/getS3ImageUrl/mockGetS3ImageUrl';
import { createMockHandler } from '@workspace/msw/createMockHandler';

const handlers = [
  createMockHandler(mockPostSocialLogin, '로그인_성공'),
  createMockHandler(mockGetMyProfile, '내_정보'),
  createMockHandler(mockGetClubInfoSearch, '동아리_정보_있음'),
  createMockHandler(mockPostRegisterClub, '동아리_등록_성공'),
  createMockHandler(mockGetS3ImageUrl, 'URL_얻어오기_성공'),
  createMockHandler(mockGetClubMembers, '동아리_회원_목록'),
  createMockHandler(mockGetClubItems, '동아리_물품_있음'),
  createMockHandler(mockPostAddClubItem, '물품_등록_성공'),
  createMockHandler(mockPostRentClubItem, '물품_대여_성공'),
  createMockHandler(mockGetClubItemHistory, '동아리_물품_대여_내역_있음'),
  createMockHandler(mockGetJoinedClubs, '내가_가입한_동아리_목록'),
  createMockHandler(mockPutClubInfo, '동아리_정보_수정_성공'),
  createMockHandler(mockGetClubNotices, '동아리_공지사항_있음'),
  createMockHandler(mockGetClubNotice, '동아리_공지사항_단건_있음'),
  createMockHandler(mockPostClubNotice, '공지사항_등록_성공'),
  createMockHandler(mockPutClubNotice, '공지사항_수정_성공'),
  createMockHandler(mockDeleteClubNotice, '공지사항_삭제_성공'),
];

export default handlers;
