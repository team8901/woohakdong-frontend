'use client';

import { useState } from 'react';

import { getMyProfile } from '@/data/user/getMyProfile/fetch';
import { type MyProfileResponse } from '@/data/user/getMyProfile/type';
import { Button } from '@workspace/ui/components/button';
import { Spinner } from '@workspace/ui/components/spinner';

interface TestButtonProps {
  onDataReceived: (data: MyProfileResponse | null) => void;
}

export const TestButton = ({ onDataReceived }: TestButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    try {
      setIsLoading(true);

      const profileData = await getMyProfile();

      onDataReceived(profileData);
    } catch (error) {
      console.error('프로필 정보를 가져오는데 실패했습니다:', error);
      onDataReceived(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleClick} disabled={isLoading}>
      {isLoading && <Spinner />}
      {isLoading ? '로딩 중...' : '프로필 정보 가져오기(토큰 여부 테스트 용도)'}
    </Button>
  );
};
