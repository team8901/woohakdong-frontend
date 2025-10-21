import { Spinner } from '@workspace/ui/components/spinner';

const Loading = () => {
  return (
    <div className="flex min-h-screen w-screen items-center justify-center">
      <Spinner className="text-muted-foreground size-6" />
    </div>
  );
};

export default Loading;
