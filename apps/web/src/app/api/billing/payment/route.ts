import { NextResponse } from 'next/server';

const TOSS_PAYMENTS_SECRET_KEY = process.env.TOSS_PAYMENTS_SECRET_KEY ?? '';

type PaymentRequest = {
  billingKey: string;
  customerKey: string;
  amount: number;
  orderId: string;
  orderName: string;
};

type TossPaymentResponse = {
  paymentKey: string;
  orderId: string;
  orderName: string;
  status: string;
  requestedAt: string;
  approvedAt: string;
  totalAmount: number;
  method: string;
  card?: {
    issuerCode: string;
    acquirerCode: string;
    number: string;
    cardType: string;
    ownerType: string;
  };
};

/**
 * 토스페이먼츠 빌링키 결제 승인 API
 * 빌링키를 사용하여 정기결제를 승인합니다.
 */
export async function POST(request: Request) {
  try {
    const body: PaymentRequest = await request.json();
    const { billingKey, customerKey, amount, orderId, orderName } = body;

    if (!billingKey || !customerKey || !amount || !orderId || !orderName) {
      return NextResponse.json(
        { message: '필수 파라미터가 누락되었습니다.' },
        { status: 400 },
      );
    }

    if (!TOSS_PAYMENTS_SECRET_KEY) {
      return NextResponse.json(
        { message: '결제 시스템 설정이 완료되지 않았습니다.' },
        { status: 500 },
      );
    }

    // 토스페이먼츠 빌링키 결제 승인 API 호출
    const credentials = Buffer.from(`${TOSS_PAYMENTS_SECRET_KEY}:`).toString(
      'base64',
    );

    const response = await fetch(
      `https://api.tosspayments.com/v1/billing/${billingKey}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${credentials}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerKey,
          amount,
          orderId,
          orderName,
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();

      console.error('TossPayments billing payment failed:', errorData);

      return NextResponse.json(
        {
          message: errorData.message ?? '결제 승인에 실패했습니다.',
          code: errorData.code,
        },
        { status: response.status },
      );
    }

    const data: TossPaymentResponse = await response.json();

    return NextResponse.json({
      paymentKey: data.paymentKey,
      orderId: data.orderId,
      orderName: data.orderName,
      status: data.status,
      approvedAt: data.approvedAt,
      totalAmount: data.totalAmount,
    });
  } catch (error) {
    console.error('Billing payment error:', error);

    return NextResponse.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}
