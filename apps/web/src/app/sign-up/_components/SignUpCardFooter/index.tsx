import { Button } from '@workspace/ui/components/button';
import { Spinner } from '@workspace/ui/components/spinner';
import { LogOutIcon } from 'lucide-react';

import { type SignupCardFooterProps } from '../../_helpers/types';

export const SignUpCardFooter = ({
  onQuit,
  isFormValid,
  isSubmitting,
}: SignupCardFooterProps) => {
  return (
    <div className="flex w-full items-center justify-between gap-6">
      <Button
        variant="secondary"
        type="button"
        onClick={onQuit}
        disabled={isSubmitting}
        aria-label="로그아웃">
        <LogOutIcon />
        로그아웃
      </Button>
      <Button
        type="submit"
        disabled={!isFormValid || isSubmitting}
        aria-label="프로필 완성하기">
        {isSubmitting ? (
          <>
            <Spinner />
            완성 중...
          </>
        ) : (
          '프로필 완성'
        )}
      </Button>
    </div>
  );
};
