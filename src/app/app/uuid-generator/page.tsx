import { UUIDULIDGenerator } from "./uuid-ulid-generator"

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <UUIDULIDGenerator />
      </div>
    </div>
  )
}
