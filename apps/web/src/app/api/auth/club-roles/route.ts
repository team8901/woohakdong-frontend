import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// 유저 권한 쿠키의 유효 기간: 30일
const CLUB_MEMBER_ROLE_MAX_AGE = 30 * 24 * 60 * 60;

export const POST = async (req: Request) => {
  try {
    const { clubMemberRole } = await req.json();
    const response = NextResponse.json(
      { message: '동아리 멤버 권한 등록 완료' },
      { status: 200 },
    );

    (await cookies()).set('clubMemberRole', clubMemberRole, {
      path: '/',
      maxAge: CLUB_MEMBER_ROLE_MAX_AGE,
      httpOnly: true,
      sameSite: 'strict',
      secure: true,
    });

    return response;
  } catch {
    return NextResponse.json(
      { message: '동아리 멤버 권한 등록 중 에러가 발생했습니다.' },
      { status: 500 },
    );
  }
};

export const DELETE = async () => {
  try {
    const response = NextResponse.json(
      { message: '동아리 멤버 권한 삭제 완료' },
      { status: 200 },
    );

    // 동아리 멤버 권한 쿠키 삭제
    (await cookies()).delete('clubMemberRole');

    return response;
  } catch {
    return NextResponse.json(
      { message: '동아리 멤버 권한 삭제 중 에러가 발생했습니다.' },
      { status: 500 },
    );
  }
};
