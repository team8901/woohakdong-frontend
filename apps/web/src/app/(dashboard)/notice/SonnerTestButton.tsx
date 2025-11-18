'use client';

import { showToast } from '@/_shared/helpers/utils/showToast';
import { Button } from '@workspace/ui/components/button';

export const SonnerTestButton = () => {
  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        onClick={() =>
          showToast({
            message: 'Default Sonner 테스트입니다',
          })
        }>
        Default Sonner
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          showToast({
            message: 'Success Sonner 테스트입니다',
            type: 'success',
          })
        }>
        Success Sonner
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          showToast({
            message: 'Info Sonner 테스트입니다',
            type: 'info',
          })
        }>
        Info Sonner
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          showToast({
            message: 'Warning Sonner 테스트입니다',
            type: 'warning',
          })
        }>
        Warning Sonner
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          showToast({
            message: 'Error Sonner 테스트입니다',
            type: 'error',
          })
        }>
        Error Sonner
      </Button>
    </div>
  );
};
