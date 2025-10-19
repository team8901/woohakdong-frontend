import { SignUpCardFooter } from '@/app/sign-up/_components/SignUpCardFooter';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const meta = {
  title: '🌐 web/src/app/sign-up/_components/SignUpCardFooter',
  component: SignUpCardFooter,
  tags: ['autodocs'],
} satisfies Meta<typeof SignUpCardFooter>;

export default meta;

type Story = StoryObj<typeof meta>;

export const 기본: Story = {
  args: {
    onQuit: async () => {},
    isFormValid: true,
    isSubmitting: false,
  },
};

export const 폼_검증_안됨: Story = {
  args: {
    onQuit: async () => {},
    isFormValid: false,
    isSubmitting: false,
  },
};

export const 제출중: Story = {
  args: {
    onQuit: async () => {},
    isFormValid: true,
    isSubmitting: true,
  },
};
