'use client';

import { useEffect, useState } from 'react';
import { ReactTyped } from 'react-typed';

import { ScrollIndicator } from '@/app/_components/ScrollIndicator';

export const HomeSectionClient = () => {
  const [showFirst, setShowFirst] = useState(false);
  const [showSecond, setShowSecond] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowFirst(true), 400);

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
              '<span class="text-primary">우학동이 대신 해 드릴게요</span>',
            ]}
            typeSpeed={55}
            backSpeed={30}
            backDelay={150}
          />
        )}
      </h1>
      <ScrollIndicator />
    </section>
  );
};
