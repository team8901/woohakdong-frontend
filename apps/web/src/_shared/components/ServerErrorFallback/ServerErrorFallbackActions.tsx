'use client';

import { logoutUser } from '@/_shared/helpers/utils/auth';
import { Button } from '@workspace/ui/components/button';
import { HomeIcon, RefreshCcwIcon } from 'lucide-react';

export const ServerErrorFallbackActions = () => {
  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={logoutUser}>
        <HomeIcon />
        로그인 화면으로
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          window.location.reload();
        }}>
        <RefreshCcwIcon />
        다시 시도
      </Button>
    </div>
  );
};
