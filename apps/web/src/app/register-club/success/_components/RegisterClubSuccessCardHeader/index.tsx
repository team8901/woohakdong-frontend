import {
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';

export const RegisterClubSuccessCardHeader = () => {
  return (
    <CardHeader>
      <CardTitle>동아리가 성공적으로 등록되었어요! 🎉</CardTitle>
      <CardDescription>
        QR 카드를 이용해서 동아리 회원이 전용 웹 페이지로 쉽게 이동할 수 있어요.
      </CardDescription>
    </CardHeader>
  );
};
