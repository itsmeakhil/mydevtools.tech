"use client"

import { useState } from "react"
import { Globe } from "lucide-react"
import { SearchBar } from "./components/search-bar"
import { StatusCodeSection } from "./components/status-code-section"
import { statusCodeSections } from "./data/status-codes"

export default function HttpStatusPage() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="min-h-screen bg-background p-6 md:p-8 lg:p-12">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="text-center space-y-1 pb-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg shadow-sm">
              <Globe className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-primary">HTTP Status Codes</h1>
          </div>
          <p className="text-muted-foreground">The list of all HTTP status codes, their name, and their meaning.</p>
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

