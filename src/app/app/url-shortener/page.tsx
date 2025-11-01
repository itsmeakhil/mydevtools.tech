'use client';
import UrlShortener from "./components/UrlShortener";
import Stats from "./components/Stats";
import useAuth from "@/utils/useAuth";
import { Card } from "@/components/ui/card";

export default function UrlShortenerPage() {
  const { user, loading } = useAuth(true); // Enforce authentication

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-muted-foreground">Loading...</span>
      </div>
    </div>;
  }

  if (!user) {
    return null; // Redirect handled by useAuth
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Main Shortener Component */}
        <UrlShortener />

        {/* Stats Section */}
        <Stats />
      </div>
    </div>
  );
}