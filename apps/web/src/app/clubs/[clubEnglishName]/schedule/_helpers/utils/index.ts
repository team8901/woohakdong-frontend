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
 * 시간을 제외한 날짜만 추출 (자정 기준)
 */
export const getDateOnly = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

/**
 * 특정 날짜가 이벤트 기간(startTime ~ endTime) 내에 포함되는지 확인
 */
export const isDateInEventRange = (
  date: Date,
  startTime: Date,
  endTime: Date,
): boolean => {
  const targetDate = getDateOnly(date);
  const startDate = getDateOnly(startTime);
  const endDate = getDateOnly(endTime);

  return targetDate >= startDate && targetDate <= endDate;
};

const MS_PER_DAY = 1000 * 60 * 60 * 24;

/**
 * 두 날짜 사이의 일수 계산 (시간 제외, 날짜 기준)
 * 예: 1월 1일 20:00 ~ 1월 2일 10:00 → 2일
 */
export const getDaysBetween = (startTime: Date, endTime: Date): number => {
  const startDate = getDateOnly(startTime);
  const endDate = getDateOnly(endTime);

  return Math.round((endDate.getTime() - startDate.getTime()) / MS_PER_DAY) + 1;
};
