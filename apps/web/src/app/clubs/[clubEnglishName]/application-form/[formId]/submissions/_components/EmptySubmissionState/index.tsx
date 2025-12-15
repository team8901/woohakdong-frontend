import { Button } from '@workspace/ui/components/button';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import { ArrowLeft, FileText } from 'lucide-react';
import Link from 'next/link';

type Props = {
  clubEnglishName: string;
};

export const EmptySubmissionState = ({ clubEnglishName }: Props) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/clubs/${clubEnglishName}/application-form`}>
            <ArrowLeft className="size-4" />
            목록으로
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader className="items-center justify-center py-12">
          <FileText className="text-muted-foreground mb-4 size-12" />
          <CardTitle className="text-lg">제출된 신청서가 없습니다</CardTitle>
          <CardDescription>
            아직 신청서를 제출한 사람이 없습니다.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
};
