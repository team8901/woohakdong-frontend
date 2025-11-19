import { toast } from 'sonner';

type ToastType = {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
};

/**
 * Sonner Toast를 보여주는 함수
 * @param message
 * @param type
 */
export const showToast = ({ message, type }: ToastType) => {
  if (type && toast[type]) {
    toast[type](message);
  } else {
    toast(message);
  }
};
