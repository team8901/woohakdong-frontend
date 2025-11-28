import { jwtTest } from '@workspace/api/generated';
import { Button } from '@workspace/ui/components/button';

export const JwtTestButton = () => {
  const onClick = async () => {
    try {
      const data = await jwtTest();

      console.log(data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Button onClick={onClick} variant="destructive">
      JWT 테스트 버튼
    </Button>
  );
};
