import { Button } from '@workspace/ui/components/button';
import { Spinner } from '@workspace/ui/components/spinner';
import { ArrowLeftIcon } from 'lucide-react';

type Props = {
  isFormValid: boolean;
  isSubmitting: boolean;
  onGoBack: () => void;
};

export const RegisterClubCardFooter = ({
  isFormValid,
  isSubmitting,
  onGoBack,
}: Props) => {
  return (
    <div className="flex w-full items-center justify-between gap-6">
      <Button
        variant="secondary"
        type="button"
        onClick={onGoBack}
        disabled={isSubmitting}
        aria-label="뒤로가기">
        <ArrowLeftIcon />
        뒤로
      </Button>
      <Button
        type="submit"
        disabled={!isFormValid || isSubmitting}
        aria-label="동아리 등록하기">
        {isSubmitting ? (
          <>
            <Spinner />
            등록 중...
          </>
        ) : (
          '동아리 등록'
        )}
      </Button>
    </div>
  );
};
