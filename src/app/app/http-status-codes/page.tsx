"use client"

import { useState } from "react"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SearchBar } from "./components/search-bar"
import { StatusCodeSection } from "./components/status-code-section"
import { statusCodeSections } from "./data/status-codes"

export default function HttpStatusPage() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="min-h-screen bg-background p-6 md:p-8 lg:p-12">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="relative">
          <div className="text-center space-y-1 pb-4">
            <h1 className="text-3xl font-bold tracking-tight">HTTP status codes</h1>
            <p className="text-muted-foreground">The list of all HTTP status codes, their name, and their meaning.</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 text-muted-foreground hover:text-primary"
          >
            <Heart className="h-5 w-5" />
          </Button>
        </div>
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
        <div className="space-y-12">
          {statusCodeSections.map((section) => (
            <StatusCodeSection key={section.title} section={section} searchQuery={searchQuery} />
          ))}
        </div>
      </div>
    </div>
  )
}

