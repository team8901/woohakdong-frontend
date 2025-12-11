import { type EventProps } from 'react-big-calendar';

import { type ScheduleEvent } from '../../_helpers/types';
import { getContrastColor } from '../../_helpers/utils';

export const CalendarEvent = ({ event }: EventProps<ScheduleEvent>) => {
  const bgColor = event.color ?? '#6366f1';
  const textColor = getContrastColor(bgColor);

  return (
    <div
      className="h-full cursor-pointer truncate rounded px-1.5 py-0.5 text-xs font-medium transition-opacity hover:opacity-90"
      style={{
        backgroundColor: bgColor,
        color: textColor,
      }}>
      {event.title}
    </div>
  );
};
