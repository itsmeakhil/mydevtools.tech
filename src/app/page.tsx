"use client";

import { getAuth, signOut as firebaseSignOut } from "firebase/auth";
import { useRouter } from 'next/navigation';
import useAuth from "@/utils/useAuth";
import { TaskProvider } from "@/context/TaskContext";
import { TaskContainer } from "@/components/TaskContainer";

export default function Home() {
  const user = useAuth();
  const auth = getAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await firebaseSignOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <TaskProvider>
      <TaskContainer onSignOut={handleSignOut} />
    </TaskProvider>
  );
}
