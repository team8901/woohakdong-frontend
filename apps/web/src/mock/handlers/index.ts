import { mockGetClubInfoSearch } from '@/mock/handlers/club/getClubInfoSearch/mockGetClubInfoSearch';
import { mockGetClubItemHistory } from '@/mock/handlers/club/getClubItemHistory/mockGetClubItemHistory';
import { mockGetClubItems } from '@/mock/handlers/club/getClubItems/mockGetClubItems';
import { mockPostRegisterClub } from '@/mock/handlers/club/postRegisterClub/mockPostRegisterClub';
import { mockGetS3ImageUrl } from '@/mock/handlers/util/getS3ImageUrl/mockGetS3ImageUrl';
import { createMockHandler } from '@workspace/msw/createMockHandler';

const handlers = [
  createMockHandler(mockGetClubInfoSearch, '동아리_정보_있음'),
  createMockHandler(mockPostRegisterClub, '동아리_등록_성공'),
  createMockHandler(mockGetS3ImageUrl, 'URL_얻어오기_성공'),
  createMockHandler(mockGetClubItems, '동아리_물품_있음'),
  createMockHandler(mockGetClubItemHistory, '동아리_물품_대여_내역_있음'),
];

export default handlers;
