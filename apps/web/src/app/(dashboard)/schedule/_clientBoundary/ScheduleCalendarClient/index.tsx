'use client';

import 'react-big-calendar/lib/css/react-big-calendar.css';

import { useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';

import { format, getDay, parse, startOfWeek } from 'date-fns';
import { ko } from 'date-fns/locale';

import { CalendarEvent } from '../../_components/CalendarEvent';
import { type ScheduleEvent } from '../../_helpers/types';
import { sampleScheduleData } from '../../_helpers/types/sampleScheduleData';
import { CalendarToolbar } from '../CalendarToobarClient';

const locales = {
  ko: ko,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const eventStyleGetter = () => ({
  style: { backgroundColor: 'transparent', border: 'none', padding: 0 },
});

export const ScheduleCalendarClient = () => {
  const [date, setDate] = useState(new Date());

  return (
    <div className="bg-background h-[calc(100vh-4rem)] w-full overflow-hidden">
      <Calendar<ScheduleEvent>
        localizer={localizer}
        events={sampleScheduleData}
        startAccessor="startTime"
        endAccessor="endTime"
        style={{ height: '100%' }}
        date={date}
        onNavigate={setDate}
        culture="ko"
        views={['month']}
        components={{
          toolbar: CalendarToolbar,
          event: CalendarEvent,
        }}
        messages={{
          next: '다음 달',
          previous: '이전 달',
          today: '오늘',
          month: '월',
          week: '주',
          day: '일',
          agenda: '일정',
          date: '날짜',
          time: '시간',
          event: '이벤트',
          noEventsInRange: '이 기간에는 일정이 없습니다.',
          showMore: (total) => `+${total}개 더보기`,
        }}
        // 이벤트 스타일 커스터마이징
        eventPropGetter={eventStyleGetter}
      />
    </div>
  );
};
