import { APP_PATH } from '@/_shared/helpers/constants/appPath';
import { type NextRequest, NextResponse } from 'next/server';

/** 권한별 유저 타입 */
const USER_ROLE = {
  준회원: 'ASSOCIATE',
  정회원: 'REGULAR',
} as const;
// TODO: 권한 없어도 동아리 목록 볼 수 있는 API 추가되면 CLUB_LIST 공개 처리
// const PUBLIC_PATHS = [APP_PATH.LOGIN, APP_PATH.CLUB_LIST];
const PUBLIC_PATHS = [APP_PATH.LOGIN];

type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];

const createRedirectResponse = (
  request: NextRequest,
  pathname: string,
): NextResponse => {
  const url = request.nextUrl.clone();

  url.pathname = pathname;

  return NextResponse.redirect(url);
};

const getDefaultPageByRole = (userRole: UserRole): string => {
  return userRole === USER_ROLE.준회원 ? APP_PATH.SIGN_UP : APP_PATH.CLUB_LIST;
};

export const middleware = (request: NextRequest) => {
  const { pathname } = request.nextUrl;
  const userRoleValue = request.cookies.get('userRole')?.value;
  const userRole: UserRole | undefined =
    userRoleValue === USER_ROLE.준회원 || userRoleValue === USER_ROLE.정회원
      ? (userRoleValue as UserRole)
      : undefined;

  // 비회원 사용자 처리
  if (!userRole) {
    // 공개 경로는 누구나 접근 가능
    if (PUBLIC_PATHS.includes(pathname)) {
      return NextResponse.next();
    }

    // 그 외 모든 경로는 로그인 페이지로 리다이렉트
    return createRedirectResponse(request, APP_PATH.LOGIN);
  }

  // 회원 사용자 처리
  if (pathname === '/' || pathname === APP_PATH.LOGIN) {
    // 루트 페이지, 로그인 페이지 접근 시 역할별 기본 페이지로 리다이렉트
    return createRedirectResponse(request, getDefaultPageByRole(userRole));
  }

  if (userRole === USER_ROLE.준회원) {
    // 준회원은 SIGN_UP, CLUB_LIST 페이지만 접근 가능
    const allowedPathsForAssociate = [APP_PATH.SIGN_UP, APP_PATH.CLUB_LIST];

    if (!allowedPathsForAssociate.includes(pathname)) {
      return createRedirectResponse(request, APP_PATH.SIGN_UP);
    }
  }

  if (userRole === USER_ROLE.정회원) {
    // 정회원은 SIGN_UP 페이지 접근 불가
    if (pathname === APP_PATH.SIGN_UP) {
      return createRedirectResponse(request, APP_PATH.CLUB_LIST);
    }
  }

  // 위 모든 조건에 해당하지 않으면 접근 허용
  return NextResponse.next();
};

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|mockServiceWorker.js).*)',
  ],
};
