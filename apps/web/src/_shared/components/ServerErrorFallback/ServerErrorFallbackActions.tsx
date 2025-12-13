'use client';

import { logoutUser } from '@/_shared/helpers/utils/auth';
import { Button } from '@workspace/ui/components/button';
import { HomeIcon, RefreshCcwIcon } from 'lucide-react';

/**
 * 서버 컴포넌트에서 에러를 throw하지 않고, 해당 에러 UI를 반환합니다.
 * - 서버 컴포넌트에서 에러를 throw하면, 전체 페이지의 스트림이 중단되어 global-error.tsx가 렌더링됩니다.
 * - 에러가 발생한 특정 컴포넌트만 fallback UI를 보여주기 위해, 에러 UI를 반환하는 방식을 사용합니다.
 * @see https://nextjs.org/docs/app/getting-started/error-handling
 */
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
