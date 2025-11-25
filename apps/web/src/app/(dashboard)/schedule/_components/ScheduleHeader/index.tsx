'use client';

import { Button } from '@workspace/ui/components/button';
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from 'lucide-react';

export const ScheduleHeader = () => {
  return (
    <div className="flex flex-col-reverse gap-2 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center justify-between md:justify-start">
        <p className="text-xl font-bold">
          {/** @todo 달력의 현재 날짜(년, 월) 가져오기 */}
          {new Date().toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
          })}
        </p>

        <div className="inline-flex w-fit rounded-md md:ml-4 rtl:space-x-reverse">
          <Button
            variant="ghost"
            onClick={() => {}}
            className="rounded-none rounded-l-md shadow-none focus-visible:z-10">
            <ChevronLeftIcon />
          </Button>
          <Button
            variant="ghost"
            onClick={() => {}}
            className="rounded-none rounded-r-md shadow-none focus-visible:z-10">
            <ChevronRightIcon />
          </Button>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary">
          오늘
        </Button>

        <Button type="button">
          <PlusIcon /> 일정 등록
        </Button>
      </div>
    </div>
  );
};
