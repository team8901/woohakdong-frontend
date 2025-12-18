'use client';

import { Badge } from '@workspace/ui/components/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog';
import { CalendarDays, Clock } from 'lucide-react';

import { DEFAULT_EVENT_COLOR } from '../../_helpers/constants';
import { type ScheduleEvent } from '../../_helpers/types';
import { getDaysBetween, isSameDay } from '../../_helpers/utils';

type Props = {
  event: ScheduleEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const formatDate = (date: Date) => {
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });
};

const formatTime = (date: Date) => {
  return date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const ScheduleDetailDialogClient = ({
  event,
  open,
  onOpenChange,
}: Props) => {
  if (!event) return null;

  const isMultiDay = !isSameDay(event.startTime, event.endTime);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div
              className="mt-1 size-3 shrink-0 rounded-full"
              style={{ backgroundColor: event.color ?? DEFAULT_EVENT_COLOR }}
            />
            <div className="flex-1">
              <DialogTitle className="text-lg">{event.title}</DialogTitle>
              <DialogDescription className="mt-2">
                {event.content}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {/* 날짜 정보 */}
          <div className="flex items-start gap-3">
            <CalendarDays className="text-muted-foreground mt-0.5 size-4" />
            <div className="text-sm">
              {isMultiDay ? (
                <div className="space-y-1">
                  <p>{formatDate(event.startTime)}</p>
                  <p className="text-muted-foreground">~</p>
                  <p>{formatDate(event.endTime)}</p>
                </div>
              ) : (
                <p>{formatDate(event.startTime)}</p>
              )}
            </div>
          </div>

          {/* 시간 정보 */}
          <div className="flex items-center gap-3">
            <Clock className="text-muted-foreground size-4" />
            <div className="text-sm">
              <span>{formatTime(event.startTime)}</span>
              <span className="text-muted-foreground mx-2">-</span>
              <span>{formatTime(event.endTime)}</span>
            </div>
          </div>

          {/* 기간 뱃지 */}
          {isMultiDay && (
            <div className="pt-2">
              <Badge variant="secondary">
                {getDaysBetween(event.startTime, event.endTime)}일간 일정
              </Badge>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
