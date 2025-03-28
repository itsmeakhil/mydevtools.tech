"use client";
import { useState } from "react";
import Link from "next/link";
import { Github, Wrench, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "./modeToggle";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Wrench className="h-6 w-6" />
            <span className="font-bold text-lg">MyDevTools</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <nav className="flex items-center gap-8 text-md font-medium">
              <Link href="/" className="transition hover:text-foreground/80">
                Home
              </Link>
              <Link href="/#features" className="transition hover:text-foreground/80">
              Features
              </Link>
              <Link href="#docs" className="transition hover:text-foreground/80">
                Docs
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            
            <div className="hidden md:flex items-center gap-4">
              <ModeToggle />
              <Link href="https://github.com/itsmeakhil/mydevtools.tech" target="_blank" rel="noreferrer">
                <Button
                  variant="outline"
                  size="icon"
                  className="border-border/50 hover:border-foreground/20"
                >
                  <Github className="h-4 w-4" />
                </Button>
              </Link>
              <Button asChild className="px-6">
                <Link href="/dashboard">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {isMenuOpen && (
        <div className="md:hidden">
          <nav className="flex flex-col space-y-4 p-6 bg-background border-t border-border/50">
            <Link href="#home" className="transition hover:text-foreground/80 font-medium">
              Home
            </Link>
            <Link href="#features" className="transition hover:text-foreground/80 font-medium">
            Features
            </Link>
            <Link href="#docs" className="transition hover:text-foreground/80 font-medium">
              Docs
            </Link>
            <Link href="/dashboard" className="transition hover:text-foreground/80 font-medium">
              Get Started
            </Link>
            <Link
              href="https://github.com/itsmeakhil/mydevtools.tech"
              target="_blank"
              rel="noreferrer"
              className="transition hover:text-foreground/80 font-medium flex items-center gap-2"
            >
              <Github className="h-4 w-4" /> GitHub
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}