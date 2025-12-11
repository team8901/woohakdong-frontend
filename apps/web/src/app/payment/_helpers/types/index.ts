import type { SubscriptionPlanId } from '../constants/plans';

export type PaymentFormData = {
  planId: SubscriptionPlanId;
};

export type PaymentResult = {
  orderId: string;
  paymentKey: string;
  amount: number;
};

export type PaymentErrorResult = {
  code: string;
  message: string;
  orderId: string;
};
