import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// 유저 권한 쿠키의 유효 기간: 30일
const USER_ROLE_MAX_AGE = 30 * 24 * 60 * 60;

export const POST = async () => {
  try {
    const response = NextResponse.json(
      { message: '유저 권한(준회원) 등록 완료' },
      { status: 200 },
    );

    // 유저 권한(준회원) 쿠키 설정
    (await cookies()).set('userRole', 'ASSOCIATE', {
      path: '/',
      maxAge: USER_ROLE_MAX_AGE,
      httpOnly: true,
      sameSite: 'strict',
      secure: true,
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

    // 유저 권한(정회원) 쿠키 설정
    (await cookies()).set('userRole', 'REGULAR', {
      path: '/',
      maxAge: USER_ROLE_MAX_AGE,
      httpOnly: true,
      sameSite: 'strict',
      secure: true,
    });

    return response;
  } catch {
    return NextResponse.json(
      { message: '유저 권한(정회원) 등록 중 에러가 발생했습니다.' },
      { status: 500 },
    );
  }
};

export const DELETE = async () => {
  try {
    const response = NextResponse.json(
      { message: '유저 권한 삭제 완료' },
      { status: 200 },
    );

    // 유저 권한 쿠키 삭제
    (await cookies()).delete('userRole');

    return response;
  } catch {
    return NextResponse.json(
      { message: '유저 권한 삭제 중 에러가 발생했습니다.' },
      { status: 500 },
    );
  }
};
