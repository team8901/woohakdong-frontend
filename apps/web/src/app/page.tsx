'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChange } from '@workspace/firebase';
import { LoaderIcon } from 'lucide-react';

function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      if (user) {
        router.push('/sign-up');
      } else {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <div className="flex min-h-svh items-center justify-center">
      <LoaderIcon className="size-6 animate-spin text-primary" />
    </div>
  );
}

export default HomePage;
