import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/header";
import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = {
  title: "Login - MyDevTools",
  description: "Login to access your developer tools and workspace",
};

export default function LoginPage() {
  return (
    <>
      <Header />
      <div className="container relative min-h-[100dvh] flex items-center justify-center font-mono py-2 sm:py-6">
        <div className="w-full max-w-md mx-auto flex items-center justify-center">
          <div className="w-full max-w-md bg-background/95 backdrop-blur-sm border border-border/50 rounded-lg p-6 shadow-lg">
            <LoginForm />
            <p className="mt-6 text-center text-sm text-muted-foreground">
              By continuing, you agree to our{" "}
              <Link
                href="/terms"
                className="underline underline-offset-4 hover:text-foreground transition-colors"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="underline underline-offset-4 hover:text-foreground transition-colors"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </>
  );
}