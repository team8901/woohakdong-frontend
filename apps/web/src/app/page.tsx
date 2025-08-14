import { LoaderIcon } from 'lucide-react';

const Page = () => {
  return (
    <div className="flex min-h-screen w-screen items-center justify-center">
      <LoaderIcon className="text-muted-foreground size-6 animate-spin" />
    </div>
  );
};

export default Page;
