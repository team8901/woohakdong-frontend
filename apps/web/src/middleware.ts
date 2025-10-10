import { type NextRequest, NextResponse } from 'next/server';

/** 권한별 유저 타입 */
const USER_ROLE = {
  비회원: 'GUEST',
  준회원: 'ASSOCIATE_USER',
  정회원: 'REGULAR_USER',
} as const;

type userRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];

const DEFAULT_USER_ROLE = USER_ROLE.비회원;

/** 권한별 허용 경로 매핑 */
const USER_ROLE_ALLOWED_PATH: Record<
  userRole,
  [string, ...(string | RegExp)[]]
> = {
  [USER_ROLE.비회원]: ['/login', '/sign-up'],
  [USER_ROLE.준회원]: ['/login', '/club-list'],
  [USER_ROLE.정회원]: [
    '/login',
    '/join-club',
    '/club-list',
    /^\/clubs\/[^/]+$/, // /clubs/{clubEnglishName} 패턴 허용 (clubEnglishName 한 개 하위 경로)
  ],
};

const DEFAULT_PATH = USER_ROLE_ALLOWED_PATH[DEFAULT_USER_ROLE];

export const middleware = (req: NextRequest) => {
  /** 현재 유저 타입 */
  const userRole = (req.cookies.get('userRole')?.value ??
    DEFAULT_USER_ROLE) as userRole;

  const url = req.nextUrl.clone();
  const pathname = url.pathname;

  /** 허용 경로 목록 */
  const allowedPaths = USER_ROLE_ALLOWED_PATH[userRole] ?? DEFAULT_PATH;

  /**
   * 권한별 허용 경로인지 여부
   * - 문자열 경로는 정확 일치 혹은 startsWith
   * - RegExp는 테스트
   */
  const isAllowedPath = allowedPaths.some((path) => {
    if (typeof path === 'string') {
      return pathname === path || pathname.startsWith(path + '/');
    }

    if (path instanceof RegExp) {
      return path.test(pathname);
    }

    return false;
  });

  if (!isAllowedPath) {
    /** 접근 불가하면 권한별 첫 허용 경로로 리다이렉트 */
    const redirectTo = USER_ROLE_ALLOWED_PATH[userRole]
      ? USER_ROLE_ALLOWED_PATH[userRole][0]
      : DEFAULT_PATH[0];

    url.pathname = redirectTo;

    return NextResponse.redirect(url);
  }

  return NextResponse.next();
};

/** 미들웨어가 matcher 경로에서만 동작하도록 설정 */
export const config = {
  matcher: [
    '/login',
    '/sign-up',
    '/join-club',
    '/club-list',
    '/clubs/:path*', // /clubs 하위 모든 경로에 대해 동작
  ],
};
