'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChange } from '@workspace/firebase/auth';
import { type User } from '@workspace/firebase/auth';
import { LoaderIcon } from 'lucide-react';

function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user: User | null) => {
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
      <LoaderIcon className="text-primary size-6 animate-spin" />
    </div>
  );
}

export default HomePage;
