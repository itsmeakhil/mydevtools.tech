"use client"

import { useState } from "react"
import Link from "next/link"
import { Github, Wrench, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "./modeToggle"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex justify-center w-full">
        <div className="container flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Wrench className="h-6 w-6" />
            <span className="font-bold">MyDevTools</span>
          </Link>
          <div className="hidden sm:flex items-center gap-6">
            <nav className="flex items-center gap-6 text-sm">
              <Link href="#features" className="transition hover:text-foreground/80">
                Features
              </Link>
              <Link href="#community" className="transition hover:text-foreground/80">
                Community
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
              className="sm:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
            <div className="hidden sm:flex items-center gap-4">
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
              <Button asChild>
                <Link href="/dashboard">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
      {isMenuOpen && (
        <div className="sm:hidden">
          <nav className="flex flex-col space-y-4 p-4 bg-background border-t border-border/50">
            <Link href="#features" className="transition hover:text-foreground/80">
              Features
            </Link>
            <Link href="#community" className="transition hover:text-foreground/80">
              Community
            </Link>
            <Link href="#docs" className="transition hover:text-foreground/80">
              Docs
            </Link>
            <Link href="/dashboard" className="transition hover:text-foreground/80">
              Get Started
            </Link>
            <Link
              href="https://github.com/itsmeakhil/mydevtools.tech"
              target="_blank"
              rel="noreferrer"
              className="transition hover:text-foreground/80"
            >
              GitHub
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}

