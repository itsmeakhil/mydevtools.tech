"use client"; // Mark this component as a Client Component

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import useAuth from "@/utils/useAuth"; // Custom hook for authentication
import { BookmarksManager } from "../component/BookmarkManager";

export default function Home() {
  const { user, loading } = useAuth(true); // Enforce authentication
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      // Redirect to login if the user is not authenticated
      router.push("/login");
    }
  }, [loading, user, router]);

  if (loading) {
    // Show a loading state while checking authentication
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    // If there's no user and loading is done, return null (redirect is handled by useEffect)
    return null;
  }

  // Render the BookmarksManager component if the user is authenticated
  return (
    <main className="min-h-screen bg-background w-full p-0 m-0">
      <BookmarksManager />
    </main>
  );
}