import { FAQ_ITEMS } from '@workspace/ui/constants/faq';
import { EXTERNAL_LINKS } from '@workspace/ui/constants/links';

export const FaqSection = () => {
  return (
    <section id="faq" className="bg-muted/50 py-20 md:py-24">
      <div className="font-pretendard container mx-auto max-w-5xl px-6">
        <h2 className="text-foreground mb-6 text-lg font-semibold md:mb-12 md:text-2xl">
          자주 묻는 질문
        </h2>
        <div className="grid gap-4 md:grid-cols-2 md:gap-6">
          {FAQ_ITEMS.map((item, idx) => (
            <div key={idx} className="bg-background rounded-2xl p-5 shadow-sm">
              <h3 className="text-foreground mb-2 text-base font-semibold md:text-lg">
                {item.question}
              </h3>
              <p className="text-muted-foreground text-sm md:text-base">
                {item.answer}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <p className="text-muted-foreground text-sm">
            더 궁금한 점이 있으신가요?{' '}
            <a
              href={`mailto:${EXTERNAL_LINKS.SUPPORT_EMAIL}`}
              className="text-primary hover:underline">
              {EXTERNAL_LINKS.SUPPORT_EMAIL}
            </a>
            으로 문의해 주세요.
          </p>
        </div>
      </div>
    </section>
  );
};
