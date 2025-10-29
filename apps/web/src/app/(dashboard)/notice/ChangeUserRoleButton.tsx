'use client';

import { Button } from '@workspace/ui/components/button';

export const ChangeUserRoleButton = () => {
  const handleClick = async () => {
    try {
      await fetch('/api/auth/roles', {
        method: 'POST',
      });

      console.log('✅ 유저 권한(준회원) 쿠키 설정 완료');
    } catch (error) {
      console.error('❌ 유저 권한(준회원) 등록 중 에러가 발생했습니다.', error);
    }
  };

  return <Button onClick={handleClick}>준회원으로 변경</Button>;
};
