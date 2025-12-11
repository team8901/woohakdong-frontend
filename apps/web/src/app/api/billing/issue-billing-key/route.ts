import { NextResponse } from 'next/server';

const TOSS_PAYMENTS_SECRET_KEY = process.env.TOSS_PAYMENTS_SECRET_KEY ?? '';

type IssueBillingKeyRequest = {
  authKey: string;
  customerKey: string;
};

type TossBillingKeyResponse = {
  billingKey: string;
  customerKey: string;
  authenticatedAt: string;
  method: string;
  card: {
    issuerCode: string;
    acquirerCode: string;
    number: string;
    cardType: string;
    ownerType: string;
    company?: string;
  };
};

/**
 * 토스페이먼츠 빌링키 발급 API
 * authKey와 customerKey를 받아 빌링키를 발급합니다.
 */
export async function POST(request: Request) {
  try {
    const body: IssueBillingKeyRequest = await request.json();
    const { authKey, customerKey } = body;

    if (!authKey || !customerKey) {
      return NextResponse.json(
        { message: 'authKey와 customerKey가 필요합니다.' },
        { status: 400 },
      );
    }

    if (!TOSS_PAYMENTS_SECRET_KEY) {
      return NextResponse.json(
        { message: '결제 시스템 설정이 완료되지 않았습니다.' },
        { status: 500 },
      );
    }

    // 토스페이먼츠 빌링키 발급 API 호출
    const credentials = Buffer.from(`${TOSS_PAYMENTS_SECRET_KEY}:`).toString(
      'base64',
    );

    const response = await fetch(
      'https://api.tosspayments.com/v1/billing/authorizations/issue',
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${credentials}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ authKey, customerKey }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();

      console.error('TossPayments billing key issue failed:', errorData);

      return NextResponse.json(
        { message: errorData.message ?? '빌링키 발급에 실패했습니다.' },
        { status: response.status },
      );
    }

    const data: TossBillingKeyResponse = await response.json();

    // 카드사 코드를 카드사명으로 변환
    const cardCompanyMap: Record<string, string> = {
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
    };

    const cardCompany =
      cardCompanyMap[data.card.issuerCode] ?? data.card.company ?? '카드';

    return NextResponse.json({
      billingKey: data.billingKey,
      customerKey: data.customerKey,
      card: {
        company: cardCompany,
        number: data.card.number,
        cardType: data.card.cardType,
      },
    });
  } catch (error) {
    console.error('Issue billing key error:', error);

    return NextResponse.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}
