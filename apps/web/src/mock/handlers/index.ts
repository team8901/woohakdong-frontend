import { mockGetClubInfoSearch } from '@/mock/handlers/club/getClubInfoSearch/mockGetClubInfoSearch';
import { createMockHandler } from '@workspace/msw/createMockHandler';

const handlers = [createMockHandler(mockGetClubInfoSearch, '동아리_정보_있음')];

export default handlers;
