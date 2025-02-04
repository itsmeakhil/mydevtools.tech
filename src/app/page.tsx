"use client";
import React from "react";
// import useAuth from '@/utils/useAuth';
import { Button } from "@/components/ui/button";
// import { useRouter } from 'next/navigation';

import Link from "next/link";
import { Card } from "@/components/ui/card";
import {
  FileJson,
  ListTodo,
  StickyNote,
  Github,
  Terminal,
  Boxes,
} from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

const Page: React.FC = () => {
  // const user = useAuth();
  // // const router = useRouter();

  // if (!user) {
  //   return null;
  // }

  // const handleRedirect = () => {
  //   router.push('/dashboard');
  // };

  return (
    // <div className="flex flex-col items-center justify-center h-screen text-center">
    //   <h1 className="text-4xl font-bold mb-4">Welcome to My Dev Tools</h1>
    //   <p className="text-xl">We are working on things!</p>
    //   <Button className="mt-4" onClick={handleRedirect}>
    //     Go to Dashboard
    //   </Button>
    // </div>

    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <Header />
      <section className="relative flex flex-col items-center justify-center space-y-4 py-12 px-4 text-center md:py-24 lg:py-32 border-b border-border/50">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.04)_0%,rgba(51, 51, 51)_80%)] dark:bg-[linear-gradient(to_bottom,rgba(0,0,0,0.04)_0%,rgba(0,0,0,0)_100%)]"></div>
        <div className="space-y-4">
          <div className="inline-block rounded-full px-3 py-1 text-xs sm:text-sm border border-border/50 bg-background">
            Open Source Developer Tools
          </div>
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
            Your Ultimate Developer Toolkit
          </h1>
          <p className="mx-auto max-w-[700px] text-sm text-muted-foreground sm:text-base md:text-lg">
            Simplify your workflow with essential developer tools. From to-do
            lists to JSON formatting, everything you need in one place.
          </p>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Link href="/dashboard" passHref>
            <Button size="lg" className="h-10 px-6 sm:h-11 sm:px-8">
              Get Started
            </Button>
          </Link>
          
          <Link 
            href="https://github.com/itsmeakhil/mydevtools.tech" 
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              size="lg"
              variant="outline"
              className="h-10 px-6 sm:h-11 sm:px-8"
            >
              View on GitHub
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container space-y-6 py-12 md:py-24">
        <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
          <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl">
            Features
          </h2>
          <p className="max-w-[85%] text-sm text-muted-foreground sm:text-base">
            Essential tools designed to boost your productivity
          </p>
        </div>
        <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
          {[
            {
              icon: ListTodo,
              title: "To-Do App",
              description: "Track tasks and manage your workflow efficiently",
            },
            {
              icon: StickyNote,
              title: "Note Taking",
              description: "Capture and organize your development notes",
            },
            {
              icon: FileJson,
              title: "JSON/YAML Tools",
              description: "Convert and format data structures with ease",
            },
          ].map((feature, index) => (
            <Card
              key={index}
              className="group relative overflow-hidden border border-border/50 bg-background p-6 transition-all hover:border-foreground/20"
            >
              <div className="flex flex-col items-center space-y-4">
                <feature.icon className="h-12 w-12" />
                <div className="space-y-2 text-center">
                  <h3 className="font-bold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Community Section */}
      <section id="community" className="border-t border-border/50">
        <div className="container space-y-6 py-12 md:py-24">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
            <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl">
              Open Source
            </h2>
            <p className="max-w-[85%] text-sm text-muted-foreground sm:text-base">
              Join our community and contribute to the future of developer tools
            </p>
          </div>
          <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
            {[
              {
                icon: Github,
                title: "GitHub",
                description: "Contribute to our open source codebase",
              },
              {
                icon: Terminal,
                title: "CLI Tools",
                description: "Build and share command-line tools",
              },
              {
                icon: Boxes,
                title: "Extensions",
                description: "Create plugins and extensions",
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className="group relative overflow-hidden border border-border/50 bg-background p-6 transition-all hover:border-foreground/20"
              >
                <div className="flex flex-col items-center space-y-4">
                  <feature.icon className="h-12 w-12" />
                  <div className="space-y-2 text-center">
                    <h3 className="font-bold">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Section */}
      <section className="border-t border-border/50">
        <div className="container space-y-6 py-12 md:py-24">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
            <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl">
              Why MyDevTools?
            </h2>
            <p className="max-w-[85%] text-sm text-muted-foreground sm:text-base">
              Built by developers, for developers
            </p>
          </div>
          <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem]">
            {[
              {
                title: "All-in-One Solution",
                description:
                  "Access all your essential development tools in one place, saving time and reducing context switching.",
              },
              {
                title: "Open Source",
                description:
                  "Fully open source and community-driven development ensures transparency and continuous improvement.",
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className="group relative overflow-hidden border border-border/50 bg-background p-6 transition-all hover:border-foreground/20"
              >
                <div className="space-y-2">
                  <h3 className="font-bold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border/50">
        <div className="container space-y-6 py-12 md:py-24">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
            <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl">
              Ready to Get Started?
            </h2>
            <p className="max-w-[85%] text-sm text-muted-foreground sm:text-base">
              Join thousands of developers who are already using MyDevTools
            </p>
            <Link
              href="/dashboard"
              rel="noopener noreferrer"
            >
              <Button size="lg" className="h-10 px-6 sm:h-11 sm:px-8">
                Try MyDevTools Now
              </Button>
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Page;
