'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import useAuth from '@/utils/useAuth';

export default function BookmarkPage() {
  const { user, loading } = useAuth(true); // Enforce authentication
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/app/bookmark/dashboard');
    }
  }, [loading, user, router]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return null; // Redirect handled by useAuth
  }

  return null; // Redirect handled by useEffect
}