export const FaqSection = () => {
  return (
    <section id="faq" className="bg-muted/50 py-20 md:py-24">
      <div className="font-pretendard container mx-auto max-w-5xl px-6">
        <h2 className="text-foreground mb-6 text-lg font-semibold md:mb-12 md:text-2xl">
          자주 묻는 질문
        </h2>
        <div className="flex flex-col gap-8 md:justify-between">
          <div className="bg-muted rounded-2xl p-5">
            <h3 className="text-foreground mb-1 text-base font-semibold md:mb-2 md:text-lg">
              어떻게 도입할 수 있나요?
            </h3>
            <p className="text-foreground text-sm md:text-base">
              사전 등록을 통해 이메일을 등록하면, 서비스가 출시되었을 때, 바로
              이용할 수 있어요.
            </p>
          </div>
          <div className="bg-muted rounded-2xl p-5">
            <h3 className="text-foreground mb-1 text-base font-semibold md:mb-2 md:text-lg">
              비용이 어떻게 되나요?
            </h3>
            <p className="text-foreground text-sm md:text-base">
              첫 6개월 이용은 무료로 이용이 가능하며, 이후 6개월마다 기본 요금
              3만원과 현재 가입되어 있는 동아리 회원 수 1명 당 500원의 추가
              요금이 부과돼요.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
