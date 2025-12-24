import { BUSINESS_INFO } from '@/app/_helpers/constants/service';
import { EXTERNAL_LINKS } from '@workspace/ui/constants/links';

export const BusinessInfo = () => {
  return (
    <div className="text-muted-foreground text-center text-xs leading-relaxed md:text-left">
      <p>
        상호명: {BUSINESS_INFO.companyName} | 대표자: {BUSINESS_INFO.ceoName} |
        사업자등록번호: {BUSINESS_INFO.registrationNumber}
      </p>
      <p className="mt-1">주소: {BUSINESS_INFO.address}</p>
      <p className="mt-1">고객문의: {EXTERNAL_LINKS.SUPPORT_EMAIL}</p>
    </div>
  );
};
