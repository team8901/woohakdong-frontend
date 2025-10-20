import { Button } from '@workspace/ui/components/button';
import { ArrowRightIcon, DownloadIcon } from 'lucide-react';

type Props = {
  onDownloadQr: () => void;
  onGoNext: () => void;
};

export const RegisterClubSuccessCardFooter = ({
  onDownloadQr,
  onGoNext,
}: Props) => {
  return (
    <div className="flex w-full items-center justify-between gap-6">
      <Button type="button" onClick={onDownloadQr}>
        <DownloadIcon />
        QR 카드 다운로드
      </Button>
      <Button
        // TODO: 엔터치면 버튼 눌리게 하기
        type="button"
        aria-label="동아리 전용 페이지로 이동"
        onClick={onGoNext}>
        우학동으로
        <ArrowRightIcon />
      </Button>
    </div>
  );
};
