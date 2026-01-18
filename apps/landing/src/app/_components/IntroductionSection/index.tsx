import { FEATURES_OVERVIEW } from '@/app/_helpers/constants/features';
import { SERVICE_NAME } from '@/app/_helpers/constants/service';

export const IntroductionSection = () => {
  return (
    <section id="introduction" className="bg-muted/50 py-24 md:py-32">
      <div className="container mx-auto max-w-5xl px-6">
        <div className="text-center">
          <h2 className="text-foreground mb-6 text-2xl font-bold md:text-4xl">
            동아리 관리, 이제는 간단하게
          </h2>
          <p className="text-muted-foreground mb-2 text-lg md:text-xl">
            {SERVICE_NAME}은 동아리 임원진을 위한 올인원 관리 서비스에요.
          </p>
          <p className="text-muted-foreground text-lg md:text-xl">
            반복되는 동아리 관리, 이제 {SERVICE_NAME}에 맡겨보세요.
          </p>
        </div>
        <div className="mt-16 grid grid-cols-2 gap-4 md:grid-cols-5 md:gap-6">
          {FEATURES_OVERVIEW.map((feature) => (
            <div
              key={feature.title}
              className="bg-background flex flex-col items-center rounded-2xl p-6 shadow-sm transition-shadow hover:shadow-md">
              <div className="bg-primary/10 mb-4 rounded-full p-3">
                <feature.icon className="text-primary size-6" />
              </div>
              <h3 className="text-foreground mb-1 font-semibold">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-center text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
