/**
 * 포트원 빌링키 결제 API
 * 빌링키를 사용하여 정기결제를 승인합니다.
 * @see https://developers.portone.io/
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

/**
 * 빌링키로 결제 요청
 */
export async function POST(request: Request) {
  try {
    const body: BillingPaymentRequest = await request.json();
    const { billingKey, paymentId, orderName, amount, currency, customer } =
      body;

    console.log('[PortOne Billing] Request received:', {
      billingKey: billingKey ? `${billingKey.slice(0, 15)}...` : 'missing',
      paymentId,
      orderName,
      amount,
    });

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

    console.log('[PortOne Billing] Requesting billing payment...');

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
                name: { full: customer.name },
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

    console.log('[PortOne Billing] Response:', {
      paymentId: data.paymentId,
      status: data.status,
    });

    if (!response.ok) {
      console.error('[PortOne Billing] Payment failed:', data);

      return NextResponse.json(
        {
          message:
            (data as unknown as { message?: string }).message ??
            '결제 승인에 실패했습니다.',
        },
        { status: response.status },
      );
    }

    console.log('[PortOne Billing] Payment successful:', data.paymentId);

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
