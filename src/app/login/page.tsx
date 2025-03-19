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
      <div className="container relative min-h-[calc(100vh-4rem)] flex items-center justify-center font-mono">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px] px-4 sm:px-0">
          <div className="bg-background/95 backdrop-blur-sm border border-border/50 rounded-lg p-8 shadow-lg">
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