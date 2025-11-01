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
        {/* Hero Section */}
        <Card className="border-2 shadow-lg bg-gradient-to-br from-primary/5 via-primary/5 to-muted/10">
          <div className="p-8 md:p-12 text-center space-y-4">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              URL Shortener
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Create short, memorable links for your long URLs. Track clicks and manage your links with ease.
            </p>
          </div>
        </Card>

        {/* Main Shortener Component */}
        <UrlShortener />

        {/* Stats Section */}
        <Stats />
      </div>
    </div>
  );
}