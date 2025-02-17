"use client"

import Link from "next/link"
import { Github, Home, Search } from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ModeToggle } from "./modeToggle"

export function NavBar() {
  return (
    <header className="sticky top-0 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className=" flex h-14 items-center pr-4 pl-4">
        <div className="flex items-center gap-2 md:gap-4">
          <SidebarTrigger className="h-8 w-8 md:h-9 md:w-9" />
          <Button variant="ghost" size="icon" className="hidden h-10 w-10 md:flex md:h-11 md:w-11" asChild>
            <Link href="/dashboard">
              <Home className="h-6 w-6 md:h-7 md:w-7" />
              <span className="sr-only">Home</span>
            </Link>
          </Button>
        </div>

        <div className="flex flex-1 items-center justify-center px-2">
          <div className="w-full max-w-2xl">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search tools..." className="pl-8 sm:w-[300px] md:w-[400px] lg:w-[500px]" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 md:h-9 md:w-9" asChild>
            <Link href="https://github.com/itsmeakhil/mydevtools.tech" target="_blank" rel="noopener noreferrer">
              <Github className="h-4 w-4 md:h-5 md:w-5" />
              <span className="sr-only">GitHub</span>
            </Link>
          </Button>
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}

