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
          <CardHeader>
            <CardTitle>만나서 반가워요! 👋🏻</CardTitle>
            <CardDescription>
              프로필 완성을 위해 몇 가지만 알려주세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SignUpForm form={form} />
          </CardContent>
          <CardFooter>
            <div className="flex w-full items-center justify-between gap-6">
              <Button variant="outline" type="button" onClick={onQuit}>
                <LogOutIcon />
                로그아웃
              </Button>
              <Button type="submit" disabled={!form.formState.isValid}>
                완료
              </Button>
            </div>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
};
