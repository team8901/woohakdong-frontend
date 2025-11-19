/**
 * 객체에서 특정 값을 가진 키를 찾습니다.
 * @param obj - 검색할 객체
 * @param value - 찾고자 하는 값
 * @returns - 값을 가진 키 또는 undefined
 */
export const getKeyByValue = <T extends Record<string, string>>(
  obj: T,
  value: T[keyof T],
): keyof T | undefined => {
  return (Object.keys(obj) as Array<keyof T>).find((key) => obj[key] === value);
};
