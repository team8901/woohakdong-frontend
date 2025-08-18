'use client';

import { useForm } from 'react-hook-form';
import { Form } from '@workspace/ui/components/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@workspace/ui/components/button';
import {
  Card,
  CardHeader,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
} from '@workspace/ui/components/card';
import { LogOutIcon, ArrowRightIcon } from 'lucide-react';
import {} from '@workspace/ui/components/card';
import { FormData, userProfileSchema } from '../../_helpers/utils/zodSchemas';
import { SignUpForm } from '../../_components/SignUpForm';
import { useSignUpForm } from '../../_helpers/hooks/useSignUpForm';

export const SignUpCardClient = () => {
  const form = useForm<FormData>({
    resolver: zodResolver(userProfileSchema),
    mode: 'onChange',
    defaultValues: {
      nickname: '',
      phoneNumber: '',
      studentId: '',
      gender: undefined,
    },
  });

  const { onQuit, onSubmit } = useSignUpForm({
    form,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader className="md:text-xl">
            <CardTitle>만나서 반가워요! 👋🏻</CardTitle>
            <CardDescription>
              간편한 시작을 위해 몇 가지만 알려주세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SignUpForm form={form} />
          </CardContent>
          <CardFooter>
            <div className="flex w-full items-center justify-between gap-6">
              <Button variant="outline" type="button" onClick={onQuit}>
                <LogOutIcon />
                <span>로그아웃</span>
              </Button>
              <Button type="submit">
                <span>완료</span>
              </Button>
            </div>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
};
