import type { StatusCodeSection as StatusCodeSectionType } from "../types"
import { StatusCodeCard } from "./status-code-card"

interface StatusCodeSectionProps {
  section: StatusCodeSectionType
  searchQuery: string
}

export function StatusCodeSection({ section, searchQuery }: StatusCodeSectionProps) {
  const filteredCodes = section.codes.filter(
    (code) =>
      code.code.toString().includes(searchQuery) ||
      code.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      code.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (filteredCodes.length === 0) return null

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">{section.title}</h2>
        <p className="text-sm text-muted-foreground">{section.description}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredCodes.map((code) => (
          <StatusCodeCard key={code.code} statusCode={code} />
        ))}
      </div>
    </section>
  )
}

