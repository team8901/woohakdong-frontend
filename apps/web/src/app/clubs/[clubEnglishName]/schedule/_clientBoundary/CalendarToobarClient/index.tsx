'use client';

import { type ToolbarProps } from 'react-big-calendar';

import { Button } from '@workspace/ui/components/button';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

import { type ScheduleEvent } from '../../_helpers/types';
import { SchedulePostingButtonClient } from '../SchedulePostingButtonClient';

export const CalendarToolbar = (toolbar: ToolbarProps<ScheduleEvent>) => (
  <div className="flex flex-col-reverse gap-2 pb-5 md:flex-row md:items-center md:justify-between md:pb-4">
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
          onClick={() => toolbar.onNavigate('PREV')}
          className="rounded-none rounded-l-md shadow-none focus-visible:z-10">
          <ChevronLeftIcon />
        </Button>
        <Button
          variant="ghost"
          onClick={() => toolbar.onNavigate('NEXT')}
          className="rounded-none rounded-r-md shadow-none focus-visible:z-10">
          <ChevronRightIcon />
        </Button>
      </div>
    </div>

    <div className="flex justify-end gap-2">
      <Button
        type="button"
        variant="secondary"
        onClick={() => toolbar.onNavigate('TODAY')}>
        오늘
      </Button>

      <SchedulePostingButtonClient />
    </div>
  </div>
);
