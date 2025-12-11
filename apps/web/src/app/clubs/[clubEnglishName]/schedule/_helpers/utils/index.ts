/**
 * 배경색에 따라 대비되는 텍스트 색상 반환
 * YIQ formula를 사용하여 밝기 계산
 */
export const getContrastColor = (hexColor: string): string => {
  if (!hexColor) return '#ffffff';

  const hex = hexColor.replace('#', '');

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  return brightness > 128 ? '#1f2937' : '#ffffff';
};

/**
 * 주어진 날짜가 오늘인지 확인
 */
export const isToday = (date: Date): boolean => {
  const today = new Date();

  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

/**
 * 두 날짜가 같은 날인지 확인
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
};

/**
 * 특정 날짜가 이벤트 기간(startTime ~ endTime) 내에 포함되는지 확인
 */
export const isDateInEventRange = (
  date: Date,
  startTime: Date,
  endTime: Date,
): boolean => {
  // 날짜만 비교하기 위해 시간 부분 제거
  const targetDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
  const startDate = new Date(
    startTime.getFullYear(),
    startTime.getMonth(),
    startTime.getDate(),
  );
  const endDate = new Date(
    endTime.getFullYear(),
    endTime.getMonth(),
    endTime.getDate(),
  );

  return targetDate >= startDate && targetDate <= endDate;
};
