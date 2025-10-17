import { SERVICE_NAME } from '@/app/_helpers/constants/service';

export const IntroductionSection = () => {
  return (
    <section id="introduction" className="bg-muted/50 py-36 md:py-48">
      <div className="container mx-auto max-w-5xl px-6 text-center">
        <h2 className="text-foreground mb-6 text-2xl font-bold md:text-4xl">
          동아리 관리, 이제는 간단하게
        </h2>
        <p className="text-muted-foreground mb-2 text-xl md:text-2xl">
          {SERVICE_NAME}은 동아리 임원진을 대상으로 동아리 관리의 불편함을
          간단하게 만들어주는 서비스에요.
        </p>
        <p className="text-muted-foreground text-xl md:text-2xl">
          여러 동아리의 임원진을 경험해 보면서, 반복되는 동아리 관리에 불편함을
          느껴 {SERVICE_NAME}을 만들었어요.
        </p>
      </div>
    </section>
  );
};
