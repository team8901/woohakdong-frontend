import { APP_PATH } from '@/_shared/helpers/constants/appPath';
import { type NextRequest, NextResponse } from 'next/server';

type UserRole = '준회원' | '정회원';

const createRedirectResponse = (
  request: NextRequest,
  pathname: string,
): NextResponse => {
  const url = request.nextUrl.clone();

  url.pathname = pathname;

  return NextResponse.redirect(url);
};

const getDefaultPageByRole = (userRole: UserRole): string => {
  return userRole === '준회원' ? APP_PATH.SIGN_UP : APP_PATH.DASHBOARD.NOTICE;
};

export const middleware = (request: NextRequest) => {
  const { pathname } = request.nextUrl;

  const userRole = request.cookies.get('userRole')?.value as
    | UserRole
    | undefined;

  const isLoginPage = pathname === APP_PATH.LOGIN;
  const isSignUpPage = pathname === APP_PATH.SIGN_UP;

  // 로그인 페이지 접근 시 처리
  if (isLoginPage) {
    // 이미 로그인한 사용자는 권한에 따라 리다이렉트
    if (userRole) {
      return createRedirectResponse(request, getDefaultPageByRole(userRole));
    }

    // 로그인하지 않은 사용자는 로그인할 수 있도록 접근 허용
    return NextResponse.next();
  }

  // 인증되지 않은 사용자는 로그인 페이지로 리다이렉트
  if (!userRole) {
    return createRedirectResponse(request, APP_PATH.LOGIN);
  }

  // 준회원은 sign-up 페이지로만 접근 가능
  if (userRole === '준회원' && !isSignUpPage) {
    return createRedirectResponse(request, APP_PATH.SIGN_UP);
  }

  // 그 외 모든 경우 접근 허용
  return NextResponse.next();
};

export const config = {
  matcher: [
    /*
     * 다음 경로를 제외한 모든 경로에 미들웨어 적용:
     * - api (API 라우트)
     * - _next/static (정적 파일)
     * - _next/image (이미지 최적화 파일)
     * - favicon.ico (파비콘)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
