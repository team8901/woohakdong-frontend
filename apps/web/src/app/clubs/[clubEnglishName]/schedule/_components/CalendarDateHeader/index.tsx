import { type DateHeaderProps } from 'react-big-calendar';

import { isToday } from '../../_helpers/utils';

export const CalendarDateHeader = ({
  date,
  label,
  isOffRange,
}: DateHeaderProps) => {
  const today = isToday(date);

  if (today) {
    return (
      <span className="bg-primary text-primary-foreground inline-flex size-7 items-center justify-center rounded-full text-sm font-semibold">
        {label}
      </span>
    );
  }

  if (isOffRange) {
    return (
      <span className="text-muted-foreground/40 inline-flex items-center justify-center text-sm font-medium">
        {label}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center justify-center text-sm font-medium">
      {label}
    </span>
  );
};
