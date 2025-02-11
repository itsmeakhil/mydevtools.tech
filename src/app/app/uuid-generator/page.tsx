import { UUIDGenerator } from "./uuid-generator"

export default function Page() {
  return (
    <div className="grid place-items-center min-h-screen ">
      <div className="w-full max-w-8xl px-8">
        <UUIDGenerator />
      </div>
    </div>
  )
}
