'use client';

import { useState } from 'react';

import { showToast } from '@/_shared/helpers/utils/showToast';
import {
  type ClubApplicationFormInfoResponse,
  type ClubInfoResponse,
  type FormQuestionType,
  useSubmitClubApplicationForm,
} from '@workspace/api/generated';
import { Button } from '@workspace/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import { Checkbox } from '@workspace/ui/components/checkbox';
import { Label } from '@workspace/ui/components/label';
import {
  RadioGroup,
  RadioGroupItem,
} from '@workspace/ui/components/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import { Spinner } from '@workspace/ui/components/spinner';
import { Textarea } from '@workspace/ui/components/textarea';
import { CheckCircle } from 'lucide-react';
import Image from 'next/image';

type Props = {
  clubId: number;
  clubInfo?: ClubInfoResponse;
  applicationForm: ClubApplicationFormInfoResponse;
};

type AnswerValue = string | string[];

export const JoinFormClient = ({
  clubId,
  clubInfo,
  applicationForm,
}: Props) => {
  const [answers, setAnswers] = useState<Record<number, AnswerValue>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { mutateAsync, isPending } = useSubmitClubApplicationForm();

  const handleAnswerChange = (order: number, value: AnswerValue) => {
    setAnswers((prev) => ({ ...prev, [order]: value }));
  };

  const handleCheckboxChange = (
    order: number,
    option: string,
    checked: boolean,
  ) => {
    setAnswers((prev) => {
      const currentAnswers = (prev[order] as string[]) || [];

      if (checked) {
        return { ...prev, [order]: [...currentAnswers, option] };
      }

      return { ...prev, [order]: currentAnswers.filter((a) => a !== option) };
    });
  };

  const handleSubmit = async () => {
    const formId = applicationForm.clubApplicationFormId;

    if (formId == null) {
      showToast({ message: '신청서 정보를 찾을 수 없습니다.', type: 'error' });

      return;
    }

    const questions = (applicationForm.formContent ?? []).filter(
      (q) => q.order != null,
    );

    for (const question of questions) {
      if (question.required) {
        const answer = answers[question.order!];

        if (!answer || (Array.isArray(answer) && answer.length === 0)) {
          showToast({
            message: `"${question.question}" 항목을 입력해주세요.`,
            type: 'error',
          });

          return;
        }
      }
    }

    try {
      await mutateAsync({
        clubId,
        applicationFormId: formId,
        data: {
          answers: questions.map((q) => ({
            order: q.order,
            answer: answers[q.order!] ?? '',
          })),
        },
      });

      setIsSubmitted(true);
      showToast({ message: '신청서가 제출되었습니다.', type: 'success' });
    } catch {
      showToast({ message: '신청서 제출에 실패했습니다.', type: 'error' });
    }
  };

  if (isSubmitted) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="items-center text-center">
          <CheckCircle className="mb-4 size-16 text-green-500" />
          <CardTitle>신청 완료!</CardTitle>
          <CardDescription>
            {clubInfo?.name ?? '동아리'} 가입 신청이 완료되었습니다.
            <br />
            승인 결과는 별도로 안내드리겠습니다.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const renderQuestion = (
    order: number,
    type: FormQuestionType,
    options: string[],
  ) => {
    switch (type) {
      case 'TEXT':
        return (
          <Textarea
            placeholder="답변을 입력하세요"
            value={(answers[order] as string) ?? ''}
            onChange={(e) => handleAnswerChange(order, e.target.value)}
            className="min-h-24 resize-none"
          />
        );

      case 'RADIO':
        return (
          <RadioGroup
            value={(answers[order] as string) ?? ''}
            onValueChange={(value: string) => handleAnswerChange(order, value)}>
            {options.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${order}-${option}`} />
                <Label htmlFor={`${order}-${option}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'CHECKBOX':
        return (
          <div className="space-y-2">
            {options.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={`${order}-${option}`}
                  checked={((answers[order] as string[]) ?? []).includes(
                    option,
                  )}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange(order, option, checked === true)
                  }
                />
                <Label htmlFor={`${order}-${option}`}>{option}</Label>
              </div>
            ))}
          </div>
        );

      case 'SELECT':
        return (
          <Select
            value={(answers[order] as string) ?? ''}
            onValueChange={(value: string) => handleAnswerChange(order, value)}>
            <SelectTrigger>
              <SelectValue placeholder="선택하세요" />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader className="text-center">
        {clubInfo?.thumbnailImageUrl && (
          <div className="mx-auto mb-4 size-20 overflow-hidden rounded-full">
            <Image
              src={clubInfo.thumbnailImageUrl}
              alt={clubInfo.name ?? '동아리'}
              width={80}
              height={80}
              className="object-cover"
            />
          </div>
        )}
        <CardTitle>{clubInfo?.name ?? '동아리'} 가입 신청</CardTitle>
        <CardDescription>{applicationForm.name}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {applicationForm.formContent?.map((question) => (
          <div key={question.order} className="space-y-2">
            <Label className="text-sm font-medium">
              {question.question}
              {question.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
            {renderQuestion(
              question.order ?? 0,
              question.type ?? 'TEXT',
              question.options ?? [],
            )}
          </div>
        ))}

        <Button className="w-full" onClick={handleSubmit} disabled={isPending}>
          {isPending ? (
            <>
              <Spinner />
              제출 중...
            </>
          ) : (
            '신청서 제출하기'
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
