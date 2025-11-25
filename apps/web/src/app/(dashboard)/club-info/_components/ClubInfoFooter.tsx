import { Button } from '@workspace/ui/components/button';
import { Spinner } from '@workspace/ui/components/spinner';

type Props = {
  isFormValid: boolean;
  isSubmitting: boolean;
  isMember?: boolean;
};

export const ClubInfoFooter = ({
  isFormValid,
  isSubmitting,
  isMember,
}: Props) => {
  if (isMember) {
    return null;
  }

  return (
    <div className="flex w-full justify-end">
      <Button
        type="submit"
        disabled={!isFormValid || isSubmitting}
        aria-label="저장하기">
        {isSubmitting ? (
          <>
            <Spinner />
            저장 중...
          </>
        ) : (
          '저장'
        )}
      </Button>
    </div>
  );
};
