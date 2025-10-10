import { Button } from '@workspace/ui/components/button';
import { ArrowLeftIcon } from 'lucide-react';

export const RegisterClubCardFooter = () => {
  return (
    <div className="flex w-full items-center justify-between gap-6">
      <Button
        variant="secondary"
        type="button"
        // TODO: onClick 핸들러 구현
        // TODO: isSubmitting 상태에 따른 disabled 처리
        aria-label="뒤로가기">
        <ArrowLeftIcon />
        뒤로
      </Button>
      <Button
        type="submit"
        // TODO: isSubmitting 상태에 따른 disabled 처리
        aria-label="동아리 등록하기">
        {/* TODO: isSubmitting 상태에 따른 문구 분기 */}
        동아리 등록
      </Button>
    </div>
  );
};
