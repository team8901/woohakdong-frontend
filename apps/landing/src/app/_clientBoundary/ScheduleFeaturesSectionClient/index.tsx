'use client';

import { useEffect, useState } from 'react';

import {
  FADE_IN_UP_IMAGE_ANIMATION,
  FADE_IN_UP_TEXT_ANIMATION,
} from '@/app/_helpers/constants/animations';
import { Badge } from '@workspace/ui/components/badge';
import { Calendar } from '@workspace/ui/components/calendar';
import { motion } from 'framer-motion';

const MOCK_SCHEDULES = [
  { date: 15, title: '정기 모임', color: 'bg-blue-500' },
  { date: 20, title: 'MT', color: 'bg-green-500' },
  { date: 25, title: '프로젝트 발표', color: 'bg-purple-500' },
];

const UPCOMING_SCHEDULES = [
  { date: '12월 15일 (일)', title: '정기 모임', time: '18:00', color: 'bg-blue-500' },
  { date: '12월 20일 (금)', title: 'MT', time: '14:00', color: 'bg-green-500' },
  { date: '12월 25일 (수)', title: '프로젝트 발표', time: '10:00', color: 'bg-purple-500' },
];

export const ScheduleFeaturesSectionClient = () => {
  const [scheduleDates, setScheduleDates] = useState<Date[]>([]);

  useEffect(() => {
    const today = new Date();
    const dates = MOCK_SCHEDULES.map(
      (s) => new Date(today.getFullYear(), today.getMonth(), s.date),
    );

    setScheduleDates(dates);
  }, []);

  return (
    <section id="feature_schedule" className="bg-background py-20 md:py-24">
      <div className="container mx-auto max-w-5xl px-6">
        <h2 className="text-primary mb-12 text-lg font-semibold md:text-2xl">
          일정
        </h2>
        <div className="flex flex-col gap-12 md:flex-row-reverse md:items-center md:justify-between">
          <motion.div
            {...FADE_IN_UP_TEXT_ANIMATION}
            className="md:w-1/2 md:gap-4">
            <h3 className="text-foreground text-2xl font-semibold md:text-4xl">
              <p>일정 공유,</p>
              <p>캘린더 하나로 끝</p>
            </h3>
            <div className="text-muted-foreground mt-4 md:text-xl">
              <p>정기 모임, MT, 행사 일정을</p>
              <p>캘린더에서 한눈에 확인하세요.</p>
            </div>
            <div className="text-muted-foreground mt-6 space-y-2 text-sm md:text-base">
              <p>• 월별/주별 캘린더 뷰</p>
              <p>• 다가오는 일정 자동 알림</p>
              <p>• 일정별 색상 구분</p>
            </div>
          </motion.div>
          <motion.div
            {...FADE_IN_UP_IMAGE_ANIMATION}
            className="bg-background flex flex-col overflow-hidden rounded-2xl shadow-lg md:w-2/5">
            <div className="flex justify-center border-b p-2">
              <Calendar
                mode="multiple"
                selected={scheduleDates}
                className="pointer-events-none"
                modifiers={{
                  scheduled: scheduleDates,
                }}
                modifiersClassNames={{
                  scheduled: 'bg-primary/20 text-primary font-semibold rounded-md',
                }}
              />
            </div>
            <div className="p-4">
              <p className="text-foreground mb-3 text-sm font-medium">다가오는 일정</p>
              <div className="space-y-2">
                {UPCOMING_SCHEDULES.map((schedule, idx) => (
                  <div
                    key={idx}
                    className="bg-muted/50 flex items-center gap-3 rounded-lg p-3">
                    <div className={`size-2 rounded-full ${schedule.color}`} />
                    <div className="flex-1">
                      <p className="text-foreground text-sm font-medium">
                        {schedule.title}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {schedule.date} · {schedule.time}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      D-{15 - idx * 5}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
