import { GoogleLoginButtonClient } from '../../_clientBoundary/GoogleLoginButtonClient';

export const LoginForm = () => {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">로그인</h1>
        <p className="text-muted-foreground text-balance">
          학교 구글 계정으로 간편하게 시작해보세요!
        </p>
      </div>
      <GoogleLoginButtonClient />
      <div className="text-center text-sm">
        도움이 필요하신가요?{' '}
        <a href="#" className="font-semibold">
          도움받기
        </a>
      </div>
      <div className="after:border-border relative after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t"></div>
      <div className="text-muted-foreground *:[a]:underline *:[a]:underline-offset-4 text-balance text-center text-xs">
        로그인 시 <a href="#">이용약관</a>과 <a href="#">개인정보 처리방침</a>에
        동의한 것으로 간주됩니다.
      </div>
    </div>
  );
};
