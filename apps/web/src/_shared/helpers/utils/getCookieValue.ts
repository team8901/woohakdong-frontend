/**
 * 클라이언트 사이드에서 쿠키 값을 가져오는 유틸 함수 (httpOnly false인 경우에만 사용 가능)
 * @param name 쿠키 이름
 * @returns 쿠키 값 (없으면 undefined)
 */
export const getCookieValue = (name: string): string | undefined => {
  if (typeof document === 'undefined') return undefined;

  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));

  return match?.[2] ? decodeURIComponent(match[2]) : undefined;
};
