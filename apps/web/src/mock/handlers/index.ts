import { mockGetClubInfoSearch } from '@/mock/handlers/club/getClubInfoSearch/mockGetClubInfoSearch';
import { mockGetClubMembers } from '@/mock/handlers/club/getClubMembers/mockGetClubMembers';
import { mockPostRegisterClub } from '@/mock/handlers/club/postRegisterClub/mockPostRegisterClub';
import { mockGetS3ImageUrl } from '@/mock/handlers/util/getS3ImageUrl/mockGetS3ImageUrl';
import { createMockHandler } from '@workspace/msw/createMockHandler';

const handlers = [
  createMockHandler(mockGetClubInfoSearch, '동아리_정보_있음'),
  createMockHandler(mockPostRegisterClub, '동아리_등록_성공'),
  createMockHandler(mockGetS3ImageUrl, 'URL_얻어오기_성공'),
  createMockHandler(mockGetClubMembers, '동아리_회원_목록'),
];

export default handlers;
