/**
 * API 응답 래퍼 타입
 * - 응답이 배열인 경우 JSON 형태로 감싸져 오기 때문에 이를 반영한 타입
 */
export type ApiResponse<T> = {
  data: T;
};
