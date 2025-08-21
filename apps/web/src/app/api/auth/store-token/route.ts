import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';

type StoreTokenRequest = {
  accessToken: string;
  refreshToken: string;
};

export const POST = async (request: NextRequest): Promise<NextResponse> => {
  try {
    const { accessToken, refreshToken }: StoreTokenRequest =
      await request.json();

    if (!accessToken || !refreshToken) {
      return NextResponse.json(
        { error: 'AccessToken과 RefreshToken이 필요합니다.' },
        { status: 400 },
      );
    }

    const cookieStore = await cookies();

    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: 'strict' as const,
    };

    // Access Token 저장
    cookieStore.set('accessToken', accessToken, {
      ...cookieOptions,
      maxAge: 60 * 15, // 만료시간 15분
    });

    // Refresh Token 저장
    cookieStore.set('refreshToken', refreshToken, {
      ...cookieOptions,
      maxAge: 60 * 60 * 24 * 7, // 만료시간 7일
    });

    return NextResponse.json(
      { message: '토큰이 성공적으로 저장되었습니다.' },
      { status: 200 },
    );
  } catch (error) {
    console.error('토큰 저장 오류:', error);

    return NextResponse.json(
      { error: '토큰 저장에 실패했습니다.' },
      { status: 500 },
    );
  }
};

export const DELETE = async (): Promise<NextResponse> => {
  try {
    const cookieStore = await cookies();

    // Access Token 삭제
    cookieStore.delete('accessToken');

    // Refresh Token 삭제
    cookieStore.delete('refreshToken');

    return NextResponse.json(
      { message: '토큰이 성공적으로 삭제되었습니다.' },
      { status: 200 },
    );
  } catch (error) {
    console.error('토큰 삭제 중 오류 발생:', error);

    return NextResponse.json(
      { error: '토큰 삭제 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
};
