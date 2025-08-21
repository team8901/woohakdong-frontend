import { SignUpFormClient } from '@/app/sign-up/_clientBoundary/SignUpFormClient';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const meta = {
  title: '🌐 web/src/app/sign-up/_clientBoundary/SignUpFormClient',
  component: SignUpFormClient,
  tags: ['autodocs'],
} satisfies Meta<typeof SignUpFormClient>;

export default meta;

type Story = StoryObj<typeof meta>;

export const 기본: Story = {};
