"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Image from "next/image";
import {
  IconUnlink,
  IconElevator,
  IconShieldCode,
  IconTimeDuration30,
  IconPasswordFingerprint,
} from "@tabler/icons-react";

const Page: React.FC = () => {
  const [isDarkTheme, setIsDarkTheme] = useState(true);

  useEffect(() => {
    const checkTheme = () => {
      const isDark = document.documentElement.classList.contains("dark");
      setIsDarkTheme(isDark);
    };

    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const urlShortener = {
    title: "URL Shortener",
    description:
      "Simplify your links with URL Shortener — Shorten long URLs for easy sharing.",
    icon: IconUnlink,
    imageDark: "/images/urlshortener/urlshortener-black.png",
    imageLight: "/images/urlshortener/urlshortener-light.png",
  };

  const uuidGenerator = {
    title: "UUIDs Generator",
    description:
      "Generate unique identifiers (UUIDs) instantly for your applications, databases, and more.",
    icon: IconElevator,
    imageDark: "/images/UUIDs generator/UUIDs generator-black.png",
    imageLight: "/images/UUIDs generator/UUIDs generator-light.png",
  };

  const encryptDecryptTool = {
    title: "Encrypt-Decrypt Text",
    description:
      "Securely encrypt and decrypt sensitive text with advanced encryption algorithms. Protect your data with ease.",
    icon: IconShieldCode,
    imageDark: "/images/Encrypt -decrypt-text/Encrypt -decrypt-text-black.png",
    imageLight: "/images/Encrypt -decrypt-text/Encrypt -decrypt-text-white.png",
  };

  const otpGeneratorTool = {
    title: "OTP Code Generator",
    description:
      "Generate secure One-Time Passwords (OTPs) instantly for authentication, verification, and secure access.",
    icon: IconTimeDuration30,
    imageDark: "/images/OTP-Code-Generator/OTP-Code-Generator-black.png",
    imageLight: "/images/OTP-Code-Generator/OTP-Code-Generator-white.png",
  };

  const tokenGeneratorTool = {
    title: "Token Generator",
    description:
      "Generate secure tokens for authentication, API keys, or session management. Create random, unique tokens instantly.",
    icon: IconPasswordFingerprint,
    imageDark: "/images/Token-generator/Token-generator-black.png",
    imageLight: "/images/Token-generator/Token-generator-light.png",
  };

  return (
    <div className="flex flex-col min-h-screen font-sans bg-background">
      {/* Header */}
      <Header />
      
      {/* Hero Section */}
      <section
        id="hero"
        className="relative py-16 md:py-24 lg:py-32 border-b border-border/10 bg-background"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                  50+ Developer Tools
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-none">
                All-in-One Developer Toolkit
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-lg">
                Access 50+ specialized tools for web development, networking,
                encryption, data conversion, and more—all in one place.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Link href="/dashboard" passHref>
                  <Button size="lg" className="h-12 px-8 rounded-md">
                    Explore Tools
                  </Button>
                </Link>
                <Link
                  href="https://github.com/itsmeakhil/mydevtools.tech"
                  passHref
                >
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-12 px-8 rounded-md flex items-center gap-2"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.757-1.333-1.757-1.087-.744.083-.729.083-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.834 2.809 1.304 3.495.998.108-.776.417-1.304.76-1.604-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                    </svg>
                    GitHub
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Hero Section - Image Container */}
            <div className="hidden lg:block relative">
              {/* Decorative Background */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/5 rounded-2xl rotate-1 transform -z-10"></div>
              
              {/* Dashboard Screenshot Container */}
              <div className="relative rounded-xl border border-border/20 bg-card/5 overflow-hidden shadow-lg">
                <div className="absolute top-0 left-0 right-0 h-10 bg-muted/30 border-b border-border/10 flex items-center px-4">
                  {/* <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  </div> */}
                </div>
                
                <div className="pt-10 pb-4 px-4">
                  {isDarkTheme ? (
                    <Image
                      src="/images/dashboard-dark.png"
                      alt="Developer Tools Dashboard - Dark Theme"
                      width={600}
                      height={400}
                      className="w-full h-auto object-contain rounded-md shadow-sm"
                      priority
                    />
                  ) : (
                    <Image
                      src="/images/dashboard-light.png"
                      alt="Developer Tools Dashboard - Light Theme"
                      width={600}
                      height={400}
                      className="w-full h-auto object-contain rounded-md shadow-sm"
                      priority
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section id="features" className="py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Supercharge Your Workflow
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover a suite of robust tools crafted to simplify coding, optimize tasks, 
              and boost your productivity as a developer.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1: URL Shortener */}
            <Card className="group border border-border/20 bg-card/5 p-6 rounded-xl transition-all hover:border-primary/20 hover:shadow-md">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <urlShortener.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">{urlShortener.title}</h3>
                <p className="text-muted-foreground">
                  {urlShortener.description}
                </p>
              </div>
              <div className="mt-6 rounded-lg bg-background border border-border/20 overflow-hidden shadow-sm transition-all group-hover:shadow-md">
                <Image
                  src={
                    isDarkTheme
                      ? urlShortener.imageDark
                      : urlShortener.imageLight
                  }
                  alt={`${urlShortener.title} Screenshot`}
                  width={400}
                  height={200}
                  className="w-full h-auto object-cover"
                />
              </div>
            </Card>

            {/* Feature 2: UUIDs Generator */}
            <Card className="group border border-border/20 bg-card/5 p-6 rounded-xl transition-all hover:border-primary/20 hover:shadow-md">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <uuidGenerator.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">{uuidGenerator.title}</h3>
                <p className="text-muted-foreground">
                  {uuidGenerator.description}
                </p>
              </div>
              <div className="mt-6 rounded-lg bg-background border border-border/20 overflow-hidden shadow-sm transition-all group-hover:shadow-md">
                <Image
                  src={
                    isDarkTheme
                      ? uuidGenerator.imageDark
                      : uuidGenerator.imageLight
                  }
                  alt={`${uuidGenerator.title} Screenshot`}
                  width={400}
                  height={200}
                  className="w-full h-auto object-cover"
                />
              </div>
            </Card>

            {/* Feature 3: Encrypt-Decrypt Tool */}
            <Card className="group border border-border/20 bg-card/5 p-6 rounded-xl transition-all hover:border-primary/20 hover:shadow-md">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <encryptDecryptTool.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">
                  {encryptDecryptTool.title}
                </h3>
                <p className="text-muted-foreground">
                  {encryptDecryptTool.description}
                </p>
              </div>
              <div className="mt-6 rounded-lg bg-background border border-border/20 overflow-hidden shadow-sm transition-all group-hover:shadow-md">
                <Image
                  src={
                    isDarkTheme
                      ? encryptDecryptTool.imageDark
                      : encryptDecryptTool.imageLight
                  }
                  alt={`${encryptDecryptTool.title} Screenshot`}
                  width={400}
                  height={200}
                  className="w-full h-auto object-cover"
                />
              </div>
            </Card>

            {/* Feature 4: OTP Generator Tool */}
            <Card className="group border border-border/20 bg-card/5 p-6 rounded-xl transition-all hover:border-primary/20 hover:shadow-md">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <otpGeneratorTool.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">{otpGeneratorTool.title}</h3>
                <p className="text-muted-foreground">
                  {otpGeneratorTool.description}
                </p>
              </div>
              <div className="mt-6 rounded-lg bg-background border border-border/20 overflow-hidden shadow-sm transition-all group-hover:shadow-md">
                <Image
                  src={
                    isDarkTheme
                      ? otpGeneratorTool.imageDark
                      : otpGeneratorTool.imageLight
                  }
                  alt={`${otpGeneratorTool.title} Screenshot`}
                  width={400}
                  height={200}
                  className="w-full h-auto object-cover"
                />
              </div>
            </Card>

            {/* Feature 5: Token Generator */}
            <Card className="group border border-border/20 bg-card/5 p-6 rounded-xl transition-all hover:border-primary/20 hover:shadow-md">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <tokenGeneratorTool.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">
                  {tokenGeneratorTool.title}
                </h3>
                <p className="text-muted-foreground">
                  {tokenGeneratorTool.description}
                </p>
              </div>
              <div className="mt-6 rounded-lg bg-background border border-border/20 overflow-hidden shadow-sm transition-all group-hover:shadow-md">
                <Image
                  src={
                    isDarkTheme
                      ? tokenGeneratorTool.imageDark
                      : tokenGeneratorTool.imageLight
                  }
                  alt={`${tokenGeneratorTool.title} Screenshot`}
                  width={400}
                  height={200}
                  className="w-full h-auto object-cover"
                />
              </div>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Page;