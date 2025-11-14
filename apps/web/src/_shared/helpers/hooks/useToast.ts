import { toast } from 'sonner';

type ToastType = {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
};

export const useToast = () => {
  /**
   * Toast 훅
   * @param message
   * @param type
   */
  const showToast = ({ message, type }: ToastType) => {
    switch (type) {
      case 'error':
        toast.error(message, {
          style: {
            '--normal-bg':
              'color-mix(in oklab, var(--destructive) 10%, var(--background))',
            '--normal-text': 'var(--destructive)',
            '--normal-border': 'var(--destructive)',
          } as React.CSSProperties,
        });
        break;
      case 'warning':
        toast.warning(message, {
          style: {
            '--normal-bg':
              'color-mix(in oklab, light-dark(var(--color-amber-600), var(--color-amber-400)) 10%, var(--background))',
            '--normal-text':
              'light-dark(var(--color-amber-600), var(--color-amber-400))',
            '--normal-border':
              'light-dark(var(--color-amber-600), var(--color-amber-400))',
          } as React.CSSProperties,
        });
        break;
      case 'success':
        toast.success(message, {
          style: {
            '--normal-bg':
              'color-mix(in oklab, light-dark(var(--color-green-600), var(--color-green-400)) 10%, var(--background))',
            '--normal-text':
              'light-dark(var(--color-green-600), var(--color-green-400))',
            '--normal-border':
              'light-dark(var(--color-green-600), var(--color-green-400))',
          } as React.CSSProperties,
        });
        break;
      case 'info':
        toast.info(message, {
          style: {
            '--normal-bg':
              'color-mix(in oklab, light-dark(var(--color-sky-600), var(--color-sky-400)) 10%, var(--background))',
            '--normal-text':
              'light-dark(var(--color-sky-600), var(--color-sky-400))',
            '--normal-border':
              'light-dark(var(--color-sky-600), var(--color-sky-400))',
          } as React.CSSProperties,
        });
        break;

      default:
        toast(message);
    }
  };

  return { showToast };
};
