'use client';

import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../../_styles/calendar.css';

import { useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';

import { format, getDay, parse, startOfWeek } from 'date-fns';
import { ko } from 'date-fns/locale';

import { CalendarDateHeader } from '../../_components/CalendarDateHeader';
import { CalendarEvent } from '../../_components/CalendarEvent';
import { ScheduleSidebar } from '../../_components/UpcomingScheduleList';
import { type ScheduleEvent } from '../../_helpers/types';
import { sampleScheduleData } from '../../_helpers/types/sampleScheduleData';
import { CalendarToolbar } from '../CalendarToobarClient';
import { ScheduleDetailDialogClient } from '../ScheduleDetailDialogClient';

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
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(
    null,
  );

  const handleSelectEvent = (event: ScheduleEvent) => {
    setSelectedEvent(event);
  };

  const handleSelectSlot = (slotInfo: { start: Date }) => {
    setSelectedDate(slotInfo.start);
  };

  return (
    <div className="bg-background flex w-full flex-col lg:flex-row">
      {/* 캘린더 영역 */}
      <div className="flex-1 p-5 md:p-8">
        <Calendar<ScheduleEvent>
          localizer={localizer}
          events={sampleScheduleData}
          startAccessor="startTime"
          endAccessor="endTime"
          date={date}
          onNavigate={setDate}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          selectable
          culture="ko"
          views={['month']}
          showAllEvents
          components={{
            toolbar: CalendarToolbar,
            event: CalendarEvent,
            month: {
              dateHeader: CalendarDateHeader,
            },
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
          }}
          eventPropGetter={eventStyleGetter}
        />
      </div>

      <ScheduleSidebar
        events={sampleScheduleData}
        selectedDate={selectedDate}
        onSelectEvent={setSelectedEvent}
        onClearDate={() => setSelectedDate(null)}
      />

      {/* 이벤트 상세 모달 */}
      <ScheduleDetailDialogClient
        event={selectedEvent}
        open={selectedEvent !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedEvent(null);
        }}
      />
    </div>
  );
};
