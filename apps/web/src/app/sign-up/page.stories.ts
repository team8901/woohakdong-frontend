import SignUpPage from '@/app/sign-up/page';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const meta = {
  title: '🌐 web/src/app/sign-up',
  component: SignUpPage,
  tags: ['autodocs'],
} satisfies Meta<typeof SignUpPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const 회원가입_페이지: Story = {};
