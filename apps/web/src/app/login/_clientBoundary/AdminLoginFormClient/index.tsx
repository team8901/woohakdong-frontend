'use client';

import { useState } from 'react';

import { showToast } from '@/_shared/helpers/utils/showToast';
import { useEmailAuthFlow } from '@/app/login/_helpers/hooks/useEmailAuthFlow';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Spinner } from '@workspace/ui/components/spinner';

export const AdminLoginFormClient = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { loginWithEmail, isLoading } = useEmailAuthFlow();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      showToast({
        message: '이메일과 비밀번호를 입력해주세요',
        type: 'error',
      });

      return;
    }

    await loginWithEmail(email, password);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">이메일</Label>
        <Input
          id="email"
          type="email"
          placeholder="이메일을 입력하세요"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="password">비밀번호</Label>
        <Input
          id="password"
          type="password"
          placeholder="비밀번호를 입력하세요"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
        />
      </div>
      <Button
        type="submit"
        variant="default"
        className="w-full"
        disabled={isLoading}
        aria-busy={isLoading}>
        {isLoading ? (
          <>
            <Spinner />
            <span>로그인 중...</span>
          </>
        ) : (
          <span>로그인</span>
        )}
      </Button>
    </form>
  );
};
