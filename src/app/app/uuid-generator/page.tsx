import { UUIDGenerator } from "./uuid-generator"

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="border-2 border-border rounded-lg shadow-lg bg-gradient-to-br from-primary/5 via-primary/5 to-muted/10 p-8 md:p-12 text-center space-y-4">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <div className="h-8 w-8 rounded bg-primary/20" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            UUID Generator & Validator
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Generate and validate Universally Unique Identifiers (UUIDs) of various versions.
          </p>
        </div>

        {/* Main Generator */}
        <UUIDGenerator />
      </div>
    </div>
  )
}
