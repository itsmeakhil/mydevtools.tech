'use client'
import React from 'react';
import useAuth from '@/utils/useAuth';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

const Page: React.FC = () => {
  const user = useAuth();
  const router = useRouter();

  if (!user) {
    return null;
  }

  const handleRedirect = () => {
    router.push('/dashboard');
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-4xl font-bold mb-4">Welcome to My Dev Tools</h1>
      <p className="text-xl">We are working on things!</p>
      <Button className="mt-4" onClick={handleRedirect}>
        Go to Dashboard
      </Button>
    </div>
  );
};

export default Page;