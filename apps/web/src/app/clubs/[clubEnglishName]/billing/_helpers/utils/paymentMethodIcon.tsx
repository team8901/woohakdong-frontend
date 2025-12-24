import { CreditCard } from 'lucide-react';
import Image from 'next/image';

type PaymentMethodIconProps = {
  cardCompany: string;
  /** Tailwind size class (e.g., 'size-4', 'size-6') */
  className?: string;
};

/**
 * 결제 수단(카드사)에 따른 아이콘 반환
 * - 카카오: 카카오페이 로고
 * - 기타: CreditCard 아이콘
 */
export const PaymentMethodIcon = ({
  cardCompany,
  className = 'size-3',
}: PaymentMethodIconProps) => {
  const lowerName = cardCompany.toLowerCase();

  if (lowerName.includes('카카오') || lowerName.includes('kakao')) {
    // className에서 size 값 추출 (예: 'size-4' -> 16, 'size-6' -> 24)
    const sizeMatch = className?.match(/size-(\d+)/);
    const size = sizeMatch?.[1] ? parseInt(sizeMatch[1], 10) * 4 : 12;

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

  return <CreditCard className={`text-blue-500 ${className}`} />;
};
