import LoginForm from './_components/LoginForm';

const LoginPage = () => {
  return (
    <div className="bg-background flex min-h-screen w-screen flex-col items-center justify-center gap-6 p-6 md:p-10">
      <a
        href="https://landing.woohakdong.com/"
        className="font-jua text-primary flex items-center gap-2 self-center text-xl transition-all hover:scale-110">
        우학동
      </a>
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
