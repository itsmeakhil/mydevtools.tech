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
      <div className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        {/* Floating Orbs */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000" />

        {/* Main Content */}
        <div className="container relative z-10 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            {/* Card */}
            <div className="relative">
              {/* Glow Effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-2xl blur-lg opacity-50 animate-pulse" />
              
              <div className="relative bg-background/80 backdrop-blur-xl border border-border/50 rounded-2xl p-8 shadow-2xl">
                {/* Logo/Brand Section */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-primary/70 rounded-2xl mb-4 shadow-lg">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-8 h-8 text-primary-foreground"
                    >
                      <path d="M12 2L2 7l10 5 10-5-10-5z" />
                      <path d="M2 17l10 5 10-5" />
                      <path d="M2 12l10 5 10-5" />
                    </svg>
                  </div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-2">
                    Welcome to MyDevTools
                  </h1>
                  <p className="text-muted-foreground">
                    Your all-in-one developer toolkit
                  </p>
                </div>

                <LoginForm />

                <div className="mt-8 pt-6 border-t border-border/50">
                  <p className="text-center text-xs text-muted-foreground">
                    By continuing, you agree to our{" "}
                    <Link
                      href="/terms"
                      className="underline underline-offset-4 hover:text-foreground transition-colors font-medium"
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/privacy"
                      className="underline underline-offset-4 hover:text-foreground transition-colors font-medium"
                    >
                      Privacy Policy
                    </Link>
                    .
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Text */}
            <p className="text-center text-sm text-muted-foreground mt-8">
              Secure authentication powered by Firebase
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
