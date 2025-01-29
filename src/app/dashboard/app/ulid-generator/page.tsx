import ULIDGenerator from "./ulid-generator"

export default function ULIDPage() {
  return (
    <div className="min-h-screen p-6 lg:ml-[var(--sidebar-width)]">
      <div className="mx-auto max-w-3xl w-full">
        <ULIDGenerator />
      </div>
    </div>
  )
}

