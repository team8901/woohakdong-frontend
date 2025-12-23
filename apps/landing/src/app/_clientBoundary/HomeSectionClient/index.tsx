'use client';

import { useEffect, useState } from 'react';
import { ReactTyped } from 'react-typed';

import { PreRegistrationDialogClient } from '@/app/_clientBoundary/PreRegistrationDialogClient';
import { ScrollIndicatorClient } from '@/app/_clientBoundary/ScrollIndicatorClient';
import { SERVICE_NAME } from '@/app/_helpers/constants/service';
import { Button } from '@workspace/ui/components/button';
import { motion } from 'framer-motion';

const SHOW_FIRST_TEXT_DELAY_MS = 400;

export const HomeSectionClient = () => {
  const [showFirst, setShowFirst] = useState(false);
  const [showSecond, setShowSecond] = useState(false);

  useEffect(() => {
    const timer = setTimeout(
      () => setShowFirst(true),
      SHOW_FIRST_TEXT_DELAY_MS,
    );

    return () => clearTimeout(timer);
  }, []);

  return (
    <section
      id="home"
      className="bg-background container mx-auto flex h-screen snap-center flex-col items-center justify-center">
      <h1 className="font-pretendard text-foreground flex flex-col justify-center text-center text-3xl font-bold md:text-6xl">
        {showFirst && (
          <ReactTyped
            strings={['귀찮았던 동아리 관리']}
            typeSpeed={55}
            showCursor={false}
            className="mb-8"
            onComplete={() => setShowSecond(true)}
          />
        )}
        {showSecond && (
          <ReactTyped
            strings={[
              '저희가',
              `<span class="text-primary">${SERVICE_NAME}이 대신 해 드릴게요</span>`,
            ]}
            typeSpeed={55}
            backSpeed={30}
            backDelay={150}
          />
        )}
      </h1>
      {showSecond && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.5 }}>
          {/* TODO: 서비스 출시 후 무료로 시작하기 버튼으로 변경 */}
          {/* <Button size="lg" className="mt-10 px-8 py-6 text-lg" asChild>
            <a href={process.env.NEXT_PUBLIC_WEB_APP_URL}>무료로 시작하기</a>
          </Button> */}
          <PreRegistrationDialogClient trackingEventName="home_cta_click">
            <Button size="lg" className="mt-10 px-8 py-6 text-lg">
              사전 등록하기
            </Button>
          </PreRegistrationDialogClient>
        </motion.div>
      )}
      <ScrollIndicatorClient />
    </section>
  );
};
