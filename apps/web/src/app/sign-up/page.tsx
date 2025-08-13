'use client';

import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@workspace/ui/components/form';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@workspace/ui/components/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import { LogOutIcon, ArrowRightIcon, ArrowLeftIcon } from 'lucide-react';
import { z } from 'zod';

// Zod Schemas
const step1Schema = z.object({
  gender: z.enum(['male', 'female'], {
    message: '성별을 선택해 주세요.',
  }),
  phone: z
    .string()
    .regex(/^01[0-9]{9,10}$/, '휴대폰 번호를 정확히 입력해 주세요.'),
});

const step2Schema = z.object({
  major: z
    .string()
    .trim()
    .min(1, '학과를 입력해 주세요.')
    .max(50, '학과는 50자 이하여야 해요.'),
  studentNumber: z
    .string()
    .trim()
    .min(1, '학번을 입력해 주세요.')
    .max(10, '학번은 10자 이하여야 해요.'),
});

const signUpSchema = step1Schema.and(step2Schema);

type FormData = z.infer<typeof signUpSchema>;

const SignUpPage = () => {
  const [step, setStep] = useState<1 | 2>(1);

  const form = useForm<FormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      gender: undefined,
      phone: '',
      major: '',
      studentNumber: '',
    },
    mode: 'onChange',
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    if (step === 1) {
      // Step 1 validation passed, move to step 2
      setStep(2);
      // Update resolver for step 2
      form.clearErrors();
      return;
    }

    // Final submission
    console.log('회원가입 완료', {
      ...data,
      phone: data.phone.replace(/\D/g, ''),
    });
    // TODO: API 연동
  };

  const handleNext = async () => {
    if (step === 1) {
      // Validate only step 1 fields
      const step1Data = {
        gender: form.getValues('gender'),
        phone: form.getValues('phone'),
      };

      const result = step1Schema.safeParse(step1Data);
      if (result.success) {
        setStep(2);
      } else {
        // Set errors manually for step 1
        result.error.issues.forEach((issue) => {
          const field = issue.path[0] as keyof FormData;
          form.setError(field, { message: issue.message });
        });
      }
    } else {
      // Submit the form for final validation and submission
      form.handleSubmit(onSubmit)();
    }
  };

  const handlePrevious = () => {
    if (step === 2) {
      setStep(1);
      form.clearErrors();
    } else {
      // TODO: 로그아웃 핸들러
      console.log('로그아웃');
    }
  };

  return (
    <div className="bg-background md:p-18 flex min-h-screen w-screen items-center justify-center px-6 py-12">
      <div className="mx-auto flex w-full max-w-md flex-col gap-12">
        {step === 1 ? (
          <div className="flex flex-col items-start justify-center text-xl font-bold">
            <p>반가워요! 🤗</p>
            <p>우학동의 멤버가 되어 함께 시작해볼까요?</p>
          </div>
        ) : (
          <div className="flex flex-col items-start justify-center text-xl font-bold">
            <p>이제 학적만 입력하면 회원가입이 완료돼요 🤩</p>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {step === 1 && (
              <div className="flex flex-col gap-6">
                {/* 이름 입력 */}
                <div className="grid w-full items-center gap-3">
                  <Label htmlFor="name">이름</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <Input
                        disabled
                        type="text"
                        id="name"
                        placeholder="강동우"
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>이름은 수정할 수 없어요</p>
                    </TooltipContent>
                  </Tooltip>
                </div>

                {/* 이메일 입력 */}
                <div className="grid w-full items-center gap-3">
                  <Label htmlFor="email">이메일</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <Input
                        disabled
                        type="email"
                        id="email"
                        placeholder="alsdn1360@ajou.ac.kr"
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>이메일은 수정할 수 없어요</p>
                    </TooltipContent>
                  </Tooltip>
                </div>

                {/* 성별 선택 */}
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>성별</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="성별을 선택해 주세요" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="male">남성</SelectItem>
                          <SelectItem value="female">여성</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 휴대폰 번호 입력 */}
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>휴대폰 번호</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          inputMode="numeric"
                          placeholder="- 없이 숫자만 입력해 주세요"
                          {...field}
                          onChange={(e) => {
                            const digits = e.target.value
                              .replace(/\D/g, '')
                              .slice(0, 11);
                            field.onChange(digits);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {step === 2 && (
              <div className="flex flex-col gap-6">
                {/* 학교 입력 */}
                <div className="grid w-full items-center gap-3">
                  <Label htmlFor="university">학교</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <Input
                        disabled
                        type="text"
                        id="university"
                        placeholder="아주대학교"
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>학교는 수정할 수 없어요</p>
                    </TooltipContent>
                  </Tooltip>
                </div>

                {/* 학과 입력 */}
                <FormField
                  control={form.control}
                  name="major"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>학과</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="학과를 입력해 주세요"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 학번 입력 */}
                <FormField
                  control={form.control}
                  name="studentNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>학번</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          inputMode="numeric"
                          placeholder="학번을 입력해 주세요"
                          {...field}
                          onChange={(e) => {
                            const digits = e.target.value
                              .replace(/\D/g, '')
                              .slice(0, 10);
                            field.onChange(digits);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </form>
        </Form>

        <div className="flex w-full items-center justify-between gap-6">
          <Button variant="outline" type="button" onClick={handlePrevious}>
            {step === 1 ? <LogOutIcon /> : <ArrowLeftIcon />}
            {step === 1 ? '로그아웃' : '이전'}
          </Button>
          <Button type="button" onClick={handleNext}>
            {step === 1 ? '다음' : '우학동 시작하기'}
            <ArrowRightIcon />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
