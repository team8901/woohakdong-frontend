'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@workspace/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
} from '@workspace/ui/components/card';
import { LogOutIcon, ArrowRightIcon, ArrowLeftIcon } from 'lucide-react';
import { CardHeader } from '@workspace/ui/components/card';
import { FormData, signUpSchema } from '../../_helpers/utils/zodSchemas';
import { SignUpForm } from '../../_components/SignUpForm';
import { useSignUpForm } from '../../_helpers/hooks/useSignUpForm';

export const SignUpCardClient = () => {
  const [step, setStep] = useState<1 | 2>(1);

  const form = useForm<FormData>({
    resolver: zodResolver(signUpSchema),
    mode: 'onChange',
    // TODO: 구글 계정으로 로그인한 정보를 받아와서 이용하는 것으로 변경해야 함
    defaultValues: {
      name: '강동우',
      email: 'alsdn1360@ajou.ac.kr',
      gender: undefined,
      phone: '',
      university: '아주대학교',
      major: '',
      studentNumber: '',
    },
  });

  const { handleNextStep, handlePreviousStep, onSubmit } = useSignUpForm({
    step,
    setStep,
    form,
  });

  return (
    <Card>
      <CardHeader className="md:text-xl">
        {step === 1 ? (
          <>
            {/* TODO: 로그인으로 받아온 이름 사용해야 함 */}
            <CardTitle>강동우님 만나서 반가워요! 👋🏻</CardTitle>
            <CardDescription>
              간편한 시작을 위해 몇 가지만 알려주세요.
            </CardDescription>
          </>
        ) : (
          <>
            <CardTitle>거의 다 왔어요! 👏🏻</CardTitle>
            <CardDescription>
              우학동 이용을 위한 마지막 단계에요.
            </CardDescription>
          </>
        )}
      </CardHeader>
      <CardContent>
        <SignUpForm form={form} step={step} onSubmit={onSubmit} />
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-center justify-between gap-6">
          <Button variant="outline" type="button" onClick={handlePreviousStep}>
            {step === 1 ? <LogOutIcon /> : <ArrowLeftIcon />}
            {step === 1 ? '로그아웃' : '이전'}
          </Button>
          <Button type="button" onClick={handleNextStep}>
            {step === 1 ? '다음' : '완료'}
            <ArrowRightIcon />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
