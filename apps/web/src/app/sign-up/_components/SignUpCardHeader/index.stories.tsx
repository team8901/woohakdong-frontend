import { SignUpCardHeader } from '@/app/sign-up/_components/SignUpCardHeader';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const meta = {
  title: '🌐 web/src/app/sign-up/_components/SignUpCardHeader',
  component: SignUpCardHeader,
  tags: ['autodocs'],
} satisfies Meta<typeof SignUpCardHeader>;

export default meta;

type Story = StoryObj<typeof meta>;

export const 기본: Story = {};
