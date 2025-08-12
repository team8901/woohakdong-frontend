'use client';
import { cn } from '@workspace/ui/lib/utils';
import { Button } from '@workspace/ui/components/button';
import { GoogleIcon } from '@workspace/ui/icons/google-icon';
import { signInWithGoogle } from '@workspace/firebase/auth';

const LoginForm = ({ className, ...props }: React.ComponentProps<'div'>) => {
  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();

      // 테스트 알럿
      console.log('Google 로그인 성공');
      alert('Google 로그인 성공');

      // TODO: 로그인 후 라우팅 추가
    } catch (error) {
      // 테스트 알럿
      console.error('Google 로그인 실패:', error);
      alert('Google 로그인 실패');
    }
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-6">
          <a
            href="https://landing.woohakdong.com/"
            className="font-jua text-primary flex items-center gap-2 self-center text-xl transition-all hover:scale-110">
            우학동
          </a>
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-2xl font-bold">로그인</h1>
            <p className="text-muted-foreground text-balance font-semibold">
              학교 구글 계정으로 간편하게 시작해보세요!
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          type="button"
          className="w-full"
          onClick={handleGoogleLogin}>
          <GoogleIcon />
          Google로 시작하기
        </Button>
        <div className="text-muted-foreground *:[a]:underline *:[a]:underline-offset-4 text-balance text-center text-sm">
          <a href="#">서비스 이용약관</a> 및 <a href="#">개인정보 처리방침</a>
        </div>
      </div>
      <div className="after:border-border relative after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t"></div>
      <div className="text-muted-foreground text-center text-sm">
        도움이 필요하신가요?{' '}
        <a href="#" className="text-foreground font-semibold">
          도움받기
        </a>
      </div>
    </div>
  );
};

export default LoginForm;
