import { ScheduleCalendarClient } from './_clientBoundary/ScheduleCalendarClient';

const REMOVE_LAYOUT_PADDING = '-m-5 md:-m-8';

const SchedulePage = () => {
  return (
    <div className={REMOVE_LAYOUT_PADDING}>
      <ScheduleCalendarClient />
    </div>
  );
};

export default SchedulePage;
