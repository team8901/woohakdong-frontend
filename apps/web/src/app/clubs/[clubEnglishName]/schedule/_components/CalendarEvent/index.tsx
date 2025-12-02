import { type EventProps } from 'react-big-calendar';

import { type ScheduleEvent } from '../../_helpers/types';

export const CalendarEvent = ({ event }: EventProps<ScheduleEvent>) => {
  return (
    <div
      className={`text-accent-foreground rounded-xs h-full truncate p-1 text-xs font-medium ${event.color ? '' : 'bg-accent'} `}
      style={{ backgroundColor: event.color }}>
      {event.title}
    </div>
  );
};
