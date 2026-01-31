'use client';

import { useEffect } from 'react';

export const dynamic = 'force-dynamic';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Bypass auth for now - go straight to home
    router.push('/home');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
