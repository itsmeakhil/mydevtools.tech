"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import {
  ArrowRight,
  Zap,
  Shield,
  Rocket,
  Sparkles,
  CheckCircle2,
  Code2,
  Lock,
  FileJson,
  KeyRound,
  Link as LinkIcon,
} from "lucide-react";

export default function Page() {
  const tools = [
    {
      title: "URL Shortener",
      description: "Simplify your links with our advanced URL shortener. Track clicks and manage your links easily.",
      icon: LinkIcon,
      href: "/dashboard",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "UUID Generator",
      description: "Generate unique identifiers (UUIDs) instantly for your applications and databases.",
      icon: KeyRound,
      href: "/dashboard",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Encryption Tool",
      description: "Securely encrypt and decrypt sensitive text with military-grade encryption algorithms.",
      icon: Lock,
      href: "/dashboard",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "JSON Formatter",
      description: "Format, validate, and minify JSON data with our powerful JSON tools.",
      icon: FileJson,
      href: "/dashboard",
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      title: "OTP Generator",
      description: "Generate secure One-Time Passwords for testing authentication flows.",
      icon: Shield,
      href: "/dashboard",
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
    {
      title: "Token Generator",
      description: "Create random, secure tokens for API keys, sessions, and more.",
      icon: Code2,
      href: "/dashboard",
      color: "text-indigo-500",
      bgColor: "bg-indigo-500/10",
    },
  ];

  const features = [
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Optimized for speed with client-side processing. No server latency.",
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your data never leaves your browser. 100% client-side execution.",
    },
    {
      icon: Rocket,
      title: "Developer First",
      description: "Built by developers, for developers. Clean APIs and intuitive UI.",
    },
    {
      icon: Sparkles,
      title: "Free Forever",
      description: "Open source and free to use. No hidden subscriptions.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background font-sans">
      <Header />

      {/* Hero Section */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
          <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]"></div>
        </div>

        <div className="container px-4 md:px-6 mx-auto text-center">
          <div className="space-y-4 max-w-3xl mx-auto">
            <Badge variant="secondary" className="px-4 py-2 text-sm font-medium rounded-full border border-primary/20 bg-primary/5 text-primary animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Sparkles className="w-4 h-4 mr-2 inline-block" />
              The Ultimate Developer Toolkit
            </Badge>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground animate-in fade-in slide-in-from-bottom-6 duration-700">
              Simplify Your <br className="hidden md:block" />
              <span className="text-primary bg-clip-text">Development Workflow</span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000">
              Access a comprehensive suite of developer tools in one place.
              From formatters to generators, we've got everything you need to code faster.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8 animate-in fade-in slide-in-from-bottom-10 duration-1000">
              <Button size="lg" className="h-12 px-8 text-base rounded-full" asChild>
                <Link href="/dashboard">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-8 text-base rounded-full" asChild>
                <Link href="https://github.com/itsmeakhil/mydevtools.tech" target="_blank">
                  View on GitHub
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-muted/30">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-none shadow-none bg-transparent">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Tools Showcase */}
      <section id="features" className="py-24">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Popular Tools</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover our most used utilities designed to boost your productivity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool, index) => (
              <Link key={index} href={tool.href}>
                <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50 hover:border-primary/50 group cursor-pointer">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg ${tool.bgColor} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300`}>
                      <tool.icon className={`w-6 h-6 ${tool.color}`} />
                    </div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      {tool.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {tool.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button variant="secondary" size="lg" className="rounded-full" asChild>
              <Link href="/dashboard">
                Explore All Tools <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary/5 relative overflow-hidden">
        <div className="container px-4 md:px-6 mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to Boost Your Productivity?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Join thousands of developers who use MyDevTools to streamline their daily tasks.
            Open source, free, and privacy-focused.
          </p>
          <Button size="lg" className="h-14 px-10 text-lg rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300" asChild>
            <Link href="/dashboard">
              Start Using Tools Now
            </Link>
          </Button>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 opacity-30">
          <div className="absolute -top-[50%] -left-[20%] w-[70%] h-[70%] rounded-full bg-primary/20 blur-[120px]" />
          <div className="absolute -bottom-[50%] -right-[20%] w-[70%] h-[70%] rounded-full bg-primary/20 blur-[120px]" />
        </div>
      </section>

      <Footer />
    </div>
  );
}
