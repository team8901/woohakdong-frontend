import { CreditCard } from 'lucide-react';
import Image from 'next/image';

type PaymentMethodIconProps = {
  cardCompany: string;
  /** Icon size in pixels */
  size?: number;
  /** Additional CSS classes */
  className?: string;
};

/**
 * 결제 수단(카드사)에 따른 아이콘 반환
 * - 카카오: 카카오페이 로고
 * - 기타: CreditCard 아이콘
 */
export const PaymentMethodIcon = ({
  cardCompany,
  size = 16,
  className,
}: PaymentMethodIconProps) => {
  const lowerName = cardCompany.toLowerCase();

  if (lowerName.includes('카카오') || lowerName.includes('kakao')) {
    return (
      <Image
        src="/icons/kakaopay.svg"
        alt="카카오페이"
        width={size}
        height={size}
        className={className}
      />
    );
  }

  return (
    <CreditCard
      size={size}
      className={className ? `text-blue-500 ${className}` : 'text-blue-500'}
    />
  );
};
