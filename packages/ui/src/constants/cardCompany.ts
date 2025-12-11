/**
 * 토스페이먼츠 카드사 코드를 카드사명으로 매핑
 * @see https://docs.tosspayments.com/reference/codes#%EC%B9%B4%EB%93%9C%EC%82%AC-%EC%BD%94%EB%93%9C
 */
export const CARD_COMPANY_MAP: Record<string, string> = {
  '3K': '기업BC',
  '46': '광주',
  '71': '롯데',
  '30': 'KDB산업',
  '31': 'BC',
  '51': '삼성',
  '38': '새마을금고',
  '41': '신한',
  '62': '신협',
  '36': '씨티',
  '33': '우리',
  '37': '우체국',
  '39': '저축',
  '35': '전북',
  '42': '제주',
  '15': '카카오뱅크',
  '3A': '케이뱅크',
  '24': '토스뱅크',
  '21': '하나',
  '61': '현대',
  '11': 'KB국민',
  '91': 'NH농협',
  '34': 'Sh수협',
} as const;

export type CardCompanyCode = keyof typeof CARD_COMPANY_MAP;

/**
 * 카드사 코드를 카드사명으로 변환
 * @param issuerCode - 토스페이먼츠 카드사 코드
 * @param fallback - 매핑되지 않을 경우 사용할 대체값
 * @returns 카드사명
 */
export const getCardCompanyName = (
  issuerCode: string,
  fallback?: string,
): string => {
  return CARD_COMPANY_MAP[issuerCode] ?? fallback ?? '카드';
};
