'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@workspace/ui/components/button';
import {
  Card,
  CardContent,
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
          <CardTitle>
            <p>반가워요! 🤗</p>
            <p>우학동의 멤버가 되어 함께 시작해볼까요?</p>
          </CardTitle>
        ) : (
          <CardTitle>
            <p>이제 학적만 입력하면 회원가입이 완료돼요 🤩</p>
          </CardTitle>
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
            {step === 1 ? '다음' : '우학동 시작하기'}
            <ArrowRightIcon />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
