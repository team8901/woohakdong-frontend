import { useMemo } from 'react';

import { Badge } from '@workspace/ui/components/badge';

import { DEFAULT_EVENT_COLOR } from '../../_helpers/constants';
import { type ScheduleEvent } from '../../_helpers/types';
import { isDateInEventRange } from '../../_helpers/utils';

type Props = {
  events: ScheduleEvent[];
  selectedDate: Date | null;
  onSelectEvent: (event: ScheduleEvent) => void;
  onClearDate: () => void;
};

const getDaysUntil = (targetDate: Date, now: Date) => {
  const diffTime = targetDate.getTime() - now.getTime();

  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const ScheduleSidebar = ({
  events,
  selectedDate,
  onSelectEvent,
  onClearDate,
}: Props) => {
  const isDateSelected = selectedDate !== null;
  const now = useMemo(() => new Date(), []);

  const displayEvents = useMemo(
    () =>
      isDateSelected
        ? events
            .filter((event) =>
              isDateInEventRange(selectedDate, event.startTime, event.endTime),
            )
            .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
        : events
            .filter((event) => event.startTime >= now)
            .sort((a, b) => a.startTime.getTime() - b.startTime.getTime()),
    [events, isDateSelected, selectedDate, now],
  );

  const title = isDateSelected
    ? selectedDate.toLocaleDateString('ko-KR', {
        month: 'long',
        day: 'numeric',
        weekday: 'long',
      })
    : '다가오는 일정';

  return (
    <aside className="bg-background w-full shrink-0 border-t p-6 lg:w-72 lg:border-l lg:border-t-0">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold">{title}</h3>
        {isDateSelected && (
          <button
            type="button"
            onClick={onClearDate}
            className="text-muted-foreground hover:text-foreground text-xs">
            전체 보기
          </button>
        )}
      </div>
      <div className="space-y-2">
        {displayEvents.map((event) => {
          const daysUntil = getDaysUntil(event.startTime, now);

          return (
            <button
              key={event.id}
              type="button"
              onClick={() => onSelectEvent(event)}
              className="bg-muted/50 hover:bg-muted w-full rounded-lg p-3 text-left transition-colors">
              <div className="flex items-center gap-3">
                <div
                  className="size-2 shrink-0 rounded-full"
                  style={{
                    backgroundColor: event.color ?? DEFAULT_EVENT_COLOR,
                  }}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{event.title}</p>
                  <p className="text-muted-foreground text-xs">
                    {isDateSelected
                      ? event.startTime.toLocaleTimeString('ko-KR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : `${event.startTime.toLocaleDateString('ko-KR', {
                          month: 'short',
                          day: 'numeric',
                          weekday: 'short',
                        })} · ${event.startTime.toLocaleTimeString('ko-KR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}`}
                  </p>
                </div>
                {!isDateSelected && daysUntil >= 0 && (
                  <Badge variant="secondary" className="shrink-0 text-xs">
                    D-{daysUntil}
                  </Badge>
                )}
              </div>
            </button>
          );
        })}
        {displayEvents.length === 0 && (
          <p className="text-muted-foreground py-4 text-center text-sm">
            {isDateSelected ? '일정이 없습니다' : '다가오는 일정이 없습니다'}
          </p>
        )}
      </div>
    </aside>
  );
};
