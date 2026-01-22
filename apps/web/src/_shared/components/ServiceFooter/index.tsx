'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@workspace/ui/components/dialog';
import { BUSINESS_INFO } from '@workspace/ui/constants/business-info';
import { EXTERNAL_LINKS } from '@workspace/ui/constants/links';

export const ServiceFooter = () => {
  return (
    <footer className="border-border bg-background border-t">
      <div className="flex items-center justify-center gap-2 px-4 py-3 text-xs text-muted-foreground">
        <span>
          &copy; {new Date().getFullYear()} {BUSINESS_INFO.serviceName}
        </span>
        <span>·</span>
        <Dialog>
          <DialogTrigger asChild>
            <button
              type="button"
              className="hover:text-foreground underline-offset-4 hover:underline"
            >
              사업자정보 확인
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>사업자 정보</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="grid grid-cols-[100px_1fr] gap-y-2">
                <span className="text-foreground font-medium">상호명</span>
                <span>{BUSINESS_INFO.companyName}</span>
                <span className="text-foreground font-medium">대표자</span>
                <span>{BUSINESS_INFO.ceoName}</span>
                <span className="text-foreground font-medium">사업자등록번호</span>
                <span>{BUSINESS_INFO.registrationNumber}</span>
                <span className="text-foreground font-medium">통신판매업</span>
                <span>{BUSINESS_INFO.ecommerceRegistration}</span>
                <span className="text-foreground font-medium">주소</span>
                <span>{BUSINESS_INFO.address}</span>
                <span className="text-foreground font-medium">전화번호</span>
                <span>{BUSINESS_INFO.phoneNumber}</span>
                <span className="text-foreground font-medium">고객문의</span>
                <span>{EXTERNAL_LINKS.SUPPORT_EMAIL}</span>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </footer>
  );
};
