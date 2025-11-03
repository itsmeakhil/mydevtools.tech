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
import { ArrowRight, Sparkles, Zap, Shield, Rocket, CheckCircle2, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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

  const features = [
    { icon: Zap, title: "Lightning Fast", description: "Get results instantly with optimized performance" },
    { icon: Shield, title: "Secure & Private", description: "Your data stays safe with client-side processing" },
    { icon: Rocket, title: "50+ Tools", description: "Comprehensive toolkit for all your development needs" },
    { icon: Sparkles, title: "Free Forever", description: "All features available without any cost" },
  ];

  const benefits = [
    "No sign-up required for most tools",
    "100% client-side processing",
    "Works offline with progressive web app support",
    "Regular updates with new tools",
    "Open source and transparent",
    "Mobile-responsive design",
  ];

  return (
    <div className="flex flex-col min-h-screen font-sans bg-background overflow-hidden">
      {/* Header */}
      <Header />
      
      {/* Hero Section */}
      <section
        id="hero"
        className="relative py-20 md:py-28 lg:py-36 overflow-hidden"
      >
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        {/* Floating Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000" />

        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="space-y-8">
              <div className="flex items-center gap-3 flex-wrap">
                <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-1.5 text-sm font-medium hover:bg-primary/20 transition-colors">
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                  50+ Developer Tools
                </Badge>
                <Badge variant="outline" className="px-4 py-1.5 text-sm">
                  Free Forever
                </Badge>
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
                <span className="bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
                  All-in-One
                </span>
                <br />
                <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                  Developer Toolkit
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground max-w-xl leading-relaxed">
                Access 50+ specialized tools for web development, networking,
                encryption, data conversion, and more—all in one place.
              </p>
              
              <div className="flex flex-wrap gap-4 pt-2">
                <Link href="/dashboard" passHref>
                  <Button 
                    size="lg" 
                    className="h-14 px-8 text-base font-semibold group relative overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      Explore Tools
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <span className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-primary/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  </Button>
                </Link>
                <Link
                  href="https://github.com/itsmeakhil/mydevtools.tech"
                  passHref
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-14 px-8 text-base font-semibold border-2 hover:bg-muted/50 transition-all duration-300 hover:scale-105"
                  >
                    <svg
                      className="h-5 w-5 mr-2"
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

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div>
                  <div className="text-3xl font-bold text-primary">50+</div>
                  <div className="text-sm text-muted-foreground mt-1">Tools</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">100%</div>
                  <div className="text-sm text-muted-foreground mt-1">Free</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">∞</div>
                  <div className="text-sm text-muted-foreground mt-1">Unlimited</div>
                </div>
              </div>
            </div>
            
            {/* Hero Section - Image Container */}
            <div className="hidden lg:block relative">
              {/* Decorative Background */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/5 rounded-3xl rotate-2 transform -z-10 blur-xl"></div>
              
              {/* Dashboard Screenshot Container */}
              <div className="relative rounded-2xl border border-border/30 bg-card/50 backdrop-blur-sm overflow-hidden shadow-2xl group hover:shadow-primary/20 transition-all duration-500 hover:scale-[1.02]">
                <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-muted/50 to-transparent border-b border-border/20 flex items-center px-4">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                  </div>
                </div>
                
                <div className="pt-12 pb-6 px-6">
                  {isDarkTheme ? (
                    <Image
                      src="/images/dashboard-dark.png"
                      alt="Developer Tools Dashboard - Dark Theme"
                      width={600}
                      height={400}
                      className="w-full h-auto object-contain rounded-lg shadow-lg"
                      priority
                    />
                  ) : (
                    <Image
                      src="/images/dashboard-light.png"
                      alt="Developer Tools Dashboard - Light Theme"
                      width={600}
                      height={400}
                      className="w-full h-auto object-contain rounded-lg shadow-lg"
                      priority
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="py-16 bg-muted/30 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={index}
                  className="border-border/20 bg-card/50 p-6 text-center group hover:border-primary/30 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 mb-4 group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
      
      {/* Featured Tools Section */}
      <section id="features" className="py-24 bg-background relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="text-center mb-16">
            <Badge className="mb-4 px-4 py-1.5">Featured Tools</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Supercharge Your Workflow
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover a suite of robust tools crafted to simplify coding, optimize tasks, 
              and boost your productivity as a developer.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1: URL Shortener */}
            <Card className="group border border-border/20 bg-card/50 p-6 rounded-2xl transition-all hover:border-primary/30 hover:shadow-xl hover:-translate-y-1 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative space-y-4">
                <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-110 transition-all">
                  <urlShortener.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-2xl font-bold">{urlShortener.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {urlShortener.description}
                </p>
              </div>
              <div className="mt-6 rounded-xl bg-background border border-border/20 overflow-hidden shadow-lg transition-all group-hover:shadow-xl group-hover:scale-[1.02]">
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
            <Card className="group border border-border/20 bg-card/50 p-6 rounded-2xl transition-all hover:border-primary/30 hover:shadow-xl hover:-translate-y-1 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative space-y-4">
                <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-110 transition-all">
                  <uuidGenerator.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-2xl font-bold">{uuidGenerator.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {uuidGenerator.description}
                </p>
              </div>
              <div className="mt-6 rounded-xl bg-background border border-border/20 overflow-hidden shadow-lg transition-all group-hover:shadow-xl group-hover:scale-[1.02]">
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
            <Card className="group border border-border/20 bg-card/50 p-6 rounded-2xl transition-all hover:border-primary/30 hover:shadow-xl hover:-translate-y-1 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative space-y-4">
                <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-110 transition-all">
                  <encryptDecryptTool.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-2xl font-bold">
                  {encryptDecryptTool.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {encryptDecryptTool.description}
                </p>
              </div>
              <div className="mt-6 rounded-xl bg-background border border-border/20 overflow-hidden shadow-lg transition-all group-hover:shadow-xl group-hover:scale-[1.02]">
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
            <Card className="group border border-border/20 bg-card/50 p-6 rounded-2xl transition-all hover:border-primary/30 hover:shadow-xl hover:-translate-y-1 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative space-y-4">
                <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-110 transition-all">
                  <otpGeneratorTool.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-2xl font-bold">{otpGeneratorTool.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {otpGeneratorTool.description}
                </p>
              </div>
              <div className="mt-6 rounded-xl bg-background border border-border/20 overflow-hidden shadow-lg transition-all group-hover:shadow-xl group-hover:scale-[1.02]">
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
            <Card className="group border border-border/20 bg-card/50 p-6 rounded-2xl transition-all hover:border-primary/30 hover:shadow-xl hover:-translate-y-1 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative space-y-4">
                <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-110 transition-all">
                  <tokenGeneratorTool.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-2xl font-bold">
                  {tokenGeneratorTool.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {tokenGeneratorTool.description}
                </p>
              </div>
              <div className="mt-6 rounded-xl bg-background border border-border/20 overflow-hidden shadow-lg transition-all group-hover:shadow-xl group-hover:scale-[1.02]">
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

      {/* Benefits Section */}
      <section className="py-24 bg-gradient-to-b from-background to-muted/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4">Why Choose Us</Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Built for Developers, 
                <br />
                <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  By Developers
                </span>
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Everything you need in one place, designed to streamline your workflow and boost productivity.
              </p>
              <div className="grid grid-cols-1 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3 group">
                    <div className="flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                    </div>
                    <p className="text-base text-muted-foreground group-hover:text-foreground transition-colors">
                      {benefit}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <Card className="p-8 border-2 border-primary/20 bg-card/50 backdrop-blur-sm shadow-2xl">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Star className="h-6 w-6 text-primary fill-primary" />
                    </div>
                    <div>
                      <div className="font-semibold">Open Source</div>
                      <div className="text-sm text-muted-foreground">Contribute on GitHub</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Shield className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold">Privacy First</div>
                      <div className="text-sm text-muted-foreground">Your data stays local</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Rocket className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold">Always Free</div>
                      <div className="text-sm text-muted-foreground">No hidden costs ever</div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Join thousands of developers using MyDevTools to streamline their workflow and boost productivity.
          </p>
          <Link href="/dashboard" passHref>
            <Button 
              size="lg" 
              className="h-14 px-10 text-base font-semibold group relative overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <span className="relative z-10 flex items-center gap-2">
                Start Using Tools Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-primary/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            </Button>
          </Link>
        </div>
      </section>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Page;
