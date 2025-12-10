import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// 유저 권한 쿠키의 유효 기간: 30일
const CLUB_MEMBER_ROLE_MAX_AGE = 30 * 24 * 60 * 60;

const cookieOptions = {
  path: '/',
  maxAge: CLUB_MEMBER_ROLE_MAX_AGE,
  httpOnly: false,
  sameSite: 'strict',
  secure: process.env.NODE_ENV === 'production',
} as const;

export const POST = async (req: Request) => {
  try {
    const { clubMemberRole, clubMembershipId } = await req.json();
    const response = NextResponse.json(
      { message: '동아리 멤버 권한 등록 완료' },
      { status: 200 },
    );

    const cookieStore = await cookies();

    if (clubMemberRole !== null) {
      cookieStore.set('clubMemberRole', clubMemberRole, cookieOptions);
    }

    if (clubMembershipId !== null) {
      cookieStore.set(
        'clubMembershipId',
        String(clubMembershipId),
        cookieOptions,
      );
    }

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

    const cookieStore = await cookies();

    cookieStore.delete('clubMemberRole');
    cookieStore.delete('clubMembershipId');

    return response;
  } catch {
    return NextResponse.json(
      { message: '동아리 멤버 권한 삭제 중 에러가 발생했습니다.' },
      { status: 500 },
    );
  }
};
