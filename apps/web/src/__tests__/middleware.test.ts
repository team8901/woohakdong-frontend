import { type NextRequest, NextResponse } from 'next/server';

import { middleware } from '../middleware';

// NextResponse 모킹
jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    next: jest.fn(() => ({ type: 'next' })),
    redirect: jest.fn(() => ({ type: 'redirect' })),
  },
}));

// URL 객체 모킹
const createMockURL = (pathname: string) => ({
  pathname,
  clone: jest.fn().mockReturnThis(),
});

// NextRequest 모킹 헬퍼
const createMockRequest = (pathname: string, userType?: string) => {
  const mockRequest = {
    nextUrl: createMockURL(pathname),
    cookies: {
      get: jest.fn((key: string) => {
        if (key === 'userType' && userType) {
          return { value: userType };
        }

        return undefined;
      }),
    },
  } as unknown as NextRequest;

  return mockRequest;
};

describe('middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('비회원 (GUEST) 사용자', () => {
    test('허용된 경로 / (홈페이지)에 접근할 수 있어야 함', () => {
      const req = createMockRequest('/');

      middleware(req);

      expect(NextResponse.next).toHaveBeenCalled();
      expect(NextResponse.redirect).not.toHaveBeenCalled();
    });

    test('허용된 경로 /login에 접근할 수 있어야 함', () => {
      const req = createMockRequest('/login');

      middleware(req);

      expect(NextResponse.next).toHaveBeenCalled();
      expect(NextResponse.redirect).not.toHaveBeenCalled();
    });

    test('허용된 경로 /sign-up에 접근할 수 있어야 함', () => {
      const req = createMockRequest('/sign-up');

      middleware(req);

      expect(NextResponse.next).toHaveBeenCalled();
      expect(NextResponse.redirect).not.toHaveBeenCalled();
    });

    test('허용되지 않은 경로 /join-club에 접근하면 / (홈페이지)로 리다이렉트되어야 함', () => {
      const req = createMockRequest('/join-club');

      middleware(req);

      expect(NextResponse.redirect).toHaveBeenCalled();
      expect(req.nextUrl.pathname).toBe('/');
    });

    test('허용되지 않은 경로 /club-list에 접근하면 / (홈페이지)로 리다이렉트되어야 함', () => {
      const req = createMockRequest('/club-list');

      middleware(req);

      expect(NextResponse.redirect).toHaveBeenCalled();
      expect(req.nextUrl.pathname).toBe('/');
    });

    test('허용되지 않은 경로 /clubs/example에 접근하면 / (홈페이지)로 리다이렉트되어야 함', () => {
      const req = createMockRequest('/clubs/example');

      middleware(req);

      expect(NextResponse.redirect).toHaveBeenCalled();
      expect(req.nextUrl.pathname).toBe('/');
    });
  });

  describe('준회원 (ASSOCIATE_USER) 사용자', () => {
    test('허용된 경로 / (홈페이지)에 접근할 수 있어야 함', () => {
      const req = createMockRequest('/', 'ASSOCIATE_USER');

      middleware(req);

      expect(NextResponse.next).toHaveBeenCalled();
      expect(NextResponse.redirect).not.toHaveBeenCalled();
    });

    test('허용된 경로 /login에 접근할 수 있어야 함', () => {
      const req = createMockRequest('/login', 'ASSOCIATE_USER');

      middleware(req);

      expect(NextResponse.next).toHaveBeenCalled();
      expect(NextResponse.redirect).not.toHaveBeenCalled();
    });

    test('허용된 경로 /club-list에 접근할 수 있어야 함', () => {
      const req = createMockRequest('/club-list', 'ASSOCIATE_USER');

      middleware(req);

      expect(NextResponse.next).toHaveBeenCalled();
      expect(NextResponse.redirect).not.toHaveBeenCalled();
    });

    test('허용되지 않은 경로 /sign-up에 접근하면 / (홈페이지)로 리다이렉트되어야 함', () => {
      const req = createMockRequest('/sign-up', 'ASSOCIATE_USER');

      middleware(req);

      expect(NextResponse.redirect).toHaveBeenCalled();
      expect(req.nextUrl.pathname).toBe('/');
    });

    test('허용되지 않은 경로 /join-club에 접근하면 / (홈페이지)로 리다이렉트되어야 함', () => {
      const req = createMockRequest('/join-club', 'ASSOCIATE_USER');

      middleware(req);

      expect(NextResponse.redirect).toHaveBeenCalled();
      expect(req.nextUrl.pathname).toBe('/');
    });

    test('허용되지 않은 경로 /clubs/example에 접근하면 / (홈페이지)로 리다이렉트되어야 함', () => {
      const req = createMockRequest('/clubs/example', 'ASSOCIATE_USER');

      middleware(req);

      expect(NextResponse.redirect).toHaveBeenCalled();
      expect(req.nextUrl.pathname).toBe('/');
    });
  });

  describe('정회원 (REGULAR_USER) 사용자', () => {
    test('허용된 경로 / (홈페이지)에 접근할 수 있어야 함', () => {
      const req = createMockRequest('/', 'REGULAR_USER');

      middleware(req);

      expect(NextResponse.next).toHaveBeenCalled();
      expect(NextResponse.redirect).not.toHaveBeenCalled();
    });

    test('허용된 경로 /login에 접근할 수 있어야 함', () => {
      const req = createMockRequest('/login', 'REGULAR_USER');

      middleware(req);

      expect(NextResponse.next).toHaveBeenCalled();
      expect(NextResponse.redirect).not.toHaveBeenCalled();
    });

    test('허용된 경로 /join-club에 접근할 수 있어야 함', () => {
      const req = createMockRequest('/join-club', 'REGULAR_USER');

      middleware(req);

      expect(NextResponse.next).toHaveBeenCalled();
      expect(NextResponse.redirect).not.toHaveBeenCalled();
    });

    test('허용된 경로 /club-list에 접근할 수 있어야 함', () => {
      const req = createMockRequest('/club-list', 'REGULAR_USER');

      middleware(req);

      expect(NextResponse.next).toHaveBeenCalled();
      expect(NextResponse.redirect).not.toHaveBeenCalled();
    });

    test('허용된 경로 /clubs/example에 접근할 수 있어야 함', () => {
      const req = createMockRequest('/clubs/example', 'REGULAR_USER');

      middleware(req);

      expect(NextResponse.next).toHaveBeenCalled();
      expect(NextResponse.redirect).not.toHaveBeenCalled();
    });

    test('허용된 경로 /clubs/test-club에 접근할 수 있어야 함', () => {
      const req = createMockRequest('/clubs/test-club', 'REGULAR_USER');

      middleware(req);

      expect(NextResponse.next).toHaveBeenCalled();
      expect(NextResponse.redirect).not.toHaveBeenCalled();
    });

    test('허용되지 않은 경로 /sign-up에 접근하면 / (홈페이지)로 리다이렉트되어야 함', () => {
      const req = createMockRequest('/sign-up', 'REGULAR_USER');

      middleware(req);

      expect(NextResponse.redirect).toHaveBeenCalled();
      expect(req.nextUrl.pathname).toBe('/');
    });

    test('허용되지 않은 경로 /clubs/example/invalid에 접근하면 / (홈페이지)로 리다이렉트되어야 함', () => {
      const req = createMockRequest('/clubs/example/invalid', 'REGULAR_USER');

      middleware(req);

      expect(NextResponse.redirect).toHaveBeenCalled();
      expect(req.nextUrl.pathname).toBe('/');
    });
  });

  describe('경로 패턴 테스트', () => {
    test('비회원 - 하위 경로가 있는 허용된 경로 /login/callback에 접근할 수 있어야 함', () => {
      const req = createMockRequest('/login/callback');

      middleware(req);

      expect(NextResponse.next).toHaveBeenCalled();
      expect(NextResponse.redirect).not.toHaveBeenCalled();
    });

    test('비회원 - 하위 경로가 있는 허용된 경로 /sign-up/step1에 접근할 수 있어야 함', () => {
      const req = createMockRequest('/sign-up/step1');

      middleware(req);

      expect(NextResponse.next).toHaveBeenCalled();
      expect(NextResponse.redirect).not.toHaveBeenCalled();
    });

    test('준회원 - 하위 경로가 있는 허용된 경로 /club-list/page/1에 접근할 수 있어야 함', () => {
      const req = createMockRequest('/club-list/page/1', 'ASSOCIATE_USER');

      middleware(req);

      expect(NextResponse.next).toHaveBeenCalled();
      expect(NextResponse.redirect).not.toHaveBeenCalled();
    });

    test('정회원 - 하위 경로가 있는 허용된 경로 /join-club/search에 접근할 수 있어야 함', () => {
      const req = createMockRequest('/join-club/search', 'REGULAR_USER');

      middleware(req);

      expect(NextResponse.next).toHaveBeenCalled();
      expect(NextResponse.redirect).not.toHaveBeenCalled();
    });
  });

  describe('기본값 테스트', () => {
    test('userType 쿠키가 없으면 비회원으로 처리되어야 함', () => {
      const req = createMockRequest('/join-club'); // 비회원에게 허용되지 않은 경로

      middleware(req);

      expect(NextResponse.redirect).toHaveBeenCalled();
      expect(req.nextUrl.pathname).toBe('/'); // 비회원의 기본 경로 (홈페이지)
    });

    test('유효하지 않은 userType이 있으면 기본값으로 처리되어야 함', () => {
      const req = createMockRequest('/join-club', 'INVALID_TYPE');

      middleware(req);

      expect(NextResponse.redirect).toHaveBeenCalled();
      expect(req.nextUrl.pathname).toBe('/'); // 기본값(비회원)의 기본 경로 (홈페이지)
    });
  });

  describe('정규식 패턴 테스트', () => {
    test('/clubs/valid-club-name 패턴은 정회원에게 허용되어야 함', () => {
      const req = createMockRequest('/clubs/my-awesome-club', 'REGULAR_USER');

      middleware(req);

      expect(NextResponse.next).toHaveBeenCalled();
      expect(NextResponse.redirect).not.toHaveBeenCalled();
    });

    test('/clubs/club-name/sub-path 패턴은 정회원에게도 허용되지 않아야 함', () => {
      const req = createMockRequest('/clubs/my-club/members', 'REGULAR_USER');

      middleware(req);

      expect(NextResponse.redirect).toHaveBeenCalled();
      expect(req.nextUrl.pathname).toBe('/'); // 정회원의 기본 경로 (홈페이지)
    });

    test('/clubs만 있는 경로는 정회원에게 허용되지 않아야 함', () => {
      const req = createMockRequest('/clubs', 'REGULAR_USER');

      middleware(req);

      expect(NextResponse.redirect).toHaveBeenCalled();
      expect(req.nextUrl.pathname).toBe('/'); // 정회원의 기본 경로 (홈페이지)
    });
  });
});
