import { toast } from 'sonner';

type ToastType = {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
};

/**
 * Toast 훅
 * @param message
 * @param type
 */
export const useToast = () => {
  const showToast = ({ message, type }: ToastType) => {
    if (type && toast[type]) {
      toast[type](message);
    } else {
      toast(message);
    }
  };

  return { showToast };
};
