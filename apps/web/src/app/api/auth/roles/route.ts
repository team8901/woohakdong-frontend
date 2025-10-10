import { setCookie } from 'cookies-next/server';
import { NextResponse } from 'next/server';

export const POST = async () => {
  try {
    const response = NextResponse.json(
      { message: '유저 권한(준회원) 등록 완료' },
      { status: 200 },
    );

    // 유저 권한(준회원) 쿠키 설정: 7일
    setCookie('userRole', '준회원', {
      path: '/',
      res: response,
      maxAge: 7 * 24 * 60 * 60,
      httpOnly: true,
      sameSite: 'strict',
      // TODO: 개발 환경에서 secure 옵션 제거
      // secure: true,
    });

    return response;
  } catch {
    return NextResponse.json(
      { message: '유저 권한(준회원) 등록 중 에러가 발생했습니다.' },
      { status: 500 },
    );
  }
};

export const PUT = async () => {
  try {
    const response = NextResponse.json(
      { message: '유저 권한(정회원) 등록 완료' },
      { status: 200 },
    );

    // 유저 권한(정회원) 쿠키 설정: 7일
    setCookie('userRole', '정회원', {
      path: '/',
      res: response,
      maxAge: 7 * 24 * 60 * 60,
      httpOnly: true,
      sameSite: 'strict',
      // TODO: 개발 환경에서 secure 옵션 제거
      // secure: true,
    });

    return response;
  } catch {
    return NextResponse.json(
      { message: '유저 권한(정회원) 등록 중 에러가 발생했습니다.' },
      { status: 500 },
    );
  }
};
