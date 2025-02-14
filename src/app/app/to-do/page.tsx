"use client";

import { useRouter } from 'next/navigation';
import useAuth from "@/utils/useAuth";
import { TaskProvider } from "@/app/app/to-do/context/TaskContext";
import { TaskContainer } from "@/app/app/to-do/TaskContainer";
import { useEffect } from 'react';

export default function Home() {
  const user = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if we're certain there's no user
    const timer = setTimeout(() => {
      if (user === null) {
        router.push('/login');
      }
    }, 1000); // Add a small delay to prevent immediate redirects

    return () => clearTimeout(timer);
  }, [user, router]);

  // Show loading state while checking auth
  if (user === undefined) {
    return <div>Loading...</div>;
  }

  // Show nothing if not authenticated
  if (user === null) {
    return null;
  }

  return (
    <TaskProvider>
      <TaskContainer />
    </TaskProvider>
  );
}
