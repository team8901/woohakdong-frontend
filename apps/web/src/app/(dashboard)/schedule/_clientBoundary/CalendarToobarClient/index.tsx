'use client';

import { type ToolbarProps } from 'react-big-calendar';

import { Button } from '@workspace/ui/components/button';
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from 'lucide-react';

import { type ScheduleEvent } from '../../_helpers/types';

export const CalendarToolbar = (toolbar: ToolbarProps<ScheduleEvent>) => {
  const goToBack = () => {
    toolbar.onNavigate('PREV');
  };

  const goToNext = () => {
    toolbar.onNavigate('NEXT');
  };

  const goToCurrent = () => {
    toolbar.onNavigate('TODAY');
  };

  return (
    <div className="flex flex-col-reverse gap-2 p-5 md:flex-row md:items-center md:justify-between md:px-8 md:py-4">
      <div className="flex items-center justify-between md:justify-start">
        <p className="text-xl font-bold">
          {toolbar.date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
          })}
        </p>

        <div className="inline-flex w-fit rounded-md md:ml-4 rtl:space-x-reverse">
          <Button
            variant="ghost"
            onClick={goToBack}
            className="rounded-none rounded-l-md shadow-none focus-visible:z-10">
            <ChevronLeftIcon />
          </Button>
          <Button
            variant="ghost"
            onClick={goToNext}
            className="rounded-none rounded-r-md shadow-none focus-visible:z-10">
            <ChevronRightIcon />
          </Button>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={goToCurrent}>
          오늘
        </Button>

        <Button type="button">
          <PlusIcon /> 일정 등록
        </Button>
      </div>
    </div>
  );
};
