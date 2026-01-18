/**
 * 포트원 빌링키 결제 API
 * 빌링키를 사용하여 정기결제를 승인합니다.
 * @see https://developers.portone.io/api/rest-v2/billingKey.payWithBillingKey
 */
import { NextResponse } from 'next/server';

const PORTONE_API_SECRET = process.env.PORTONE_API_SECRET ?? '';

type BillingPaymentRequest = {
  billingKey: string;
  paymentId: string; // 고유한 결제 ID
  orderName: string;
  amount: number;
  currency?: string;
  customer?: {
    id?: string;
    name?: string;
    email?: string;
    phoneNumber?: string;
  };
};

type PortoneBillingResponse = {
  paymentId: string;
  transactionId: string;
  status: string;
  paidAt?: string;
  amount?: {
    total: number;
    paid: number;
  };
};

type PortoneErrorResponse = {
  type?: string;
  message?: string;
  code?: string;
};

/**
 * PortOne 에러 응답인지 확인하는 타입 가드
 */
function isPortoneErrorResponse(data: unknown): data is PortoneErrorResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    ('message' in data || 'code' in data || 'type' in data)
  );
}

/**
 * 에러 응답에서 메시지 추출
 */
function getErrorMessage(data: unknown, defaultMessage: string): string {
  if (isPortoneErrorResponse(data) && data.message) {
    return data.message;
  }

  return defaultMessage;
}

/**
 * 빌링키로 결제 요청
 */
export async function POST(request: Request) {
  try {
    const body: BillingPaymentRequest = await request.json();
    const { billingKey, paymentId, orderName, amount, currency, customer } =
      body;

    if (!billingKey || !paymentId || !orderName || !amount) {
      console.error('[PortOne Billing] Missing required parameters');

      return NextResponse.json(
        { message: '필수 파라미터가 누락되었습니다.' },
        { status: 400 },
      );
    }

    // Mock 빌링키는 실제 API에서 사용할 수 없음
    if (billingKey.startsWith('mock_')) {
      console.error(
        '[PortOne Billing] Mock billing key cannot be used with real API',
      );

      return NextResponse.json(
        {
          message:
            'Mock 빌링키는 실제 결제에 사용할 수 없습니다. 실제 카드를 등록해주세요.',
        },
        { status: 400 },
      );
    }

    if (!PORTONE_API_SECRET) {
      console.error('[PortOne Billing] Missing API secret');

      return NextResponse.json(
        { message: '결제 시스템 설정이 완료되지 않았습니다.' },
        { status: 500 },
      );
    }

    // 포트원 빌링키 결제 API 호출
    const response = await fetch(
      `https://api.portone.io/payments/${encodeURIComponent(paymentId)}/billing-key`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `PortOne ${PORTONE_API_SECRET}`,
        },
        body: JSON.stringify({
          billingKey,
          orderName,
          amount: {
            total: amount,
          },
          currency: currency ?? 'KRW',
          customer: customer
            ? {
                id: customer.id,
                ...(customer.name && { name: { full: customer.name } }),
                email: customer.email,
                phoneNumber: customer.phoneNumber,
              }
            : undefined,
        }),
      },
    );

    const responseText = await response.text();

    // HTML 응답인 경우 에러 처리
    if (
      responseText.startsWith('<!DOCTYPE') ||
      responseText.startsWith('<html')
    ) {
      console.error(
        '[PortOne Billing] Received HTML response:',
        responseText.slice(0, 200),
      );

      return NextResponse.json(
        { message: '결제 API 응답 오류가 발생했습니다.' },
        { status: 500 },
      );
    }

    const data: PortoneBillingResponse = JSON.parse(responseText);

    if (!response.ok) {
      console.error('[PortOne Billing] Payment failed:', data);

      return NextResponse.json(
        { message: getErrorMessage(data, '결제 승인에 실패했습니다.') },
        { status: response.status },
      );
    }

    return NextResponse.json({
      paymentId: data.paymentId,
      transactionId: data.transactionId,
      status: data.status,
      paidAt: data.paidAt,
      amount: data.amount?.paid ?? amount,
    });
  } catch (error) {
    console.error('[PortOne Billing] Error:', error);

    const errorMessage =
      error instanceof Error ? error.message : '서버 오류가 발생했습니다.';

    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
