'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChange, type User } from '@workspace/firebase/auth';
import { LoaderIcon } from 'lucide-react';

function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user: User | null) => {
      if (user) {
        router.replace('/sign-up');
      } else {
        router.replace('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <div className="flex min-h-svh items-center justify-center">
      <LoaderIcon className="text-primary size-6 animate-spin" />
    </div>
  );
}

export default HomePage;
