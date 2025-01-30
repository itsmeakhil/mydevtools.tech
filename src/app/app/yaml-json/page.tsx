import { FormatConverter } from "../components/format-converter"
import { conversionConfigs } from "../types/converter"

export const metadata = {
  title: "YAML to JSON Converter - MyDevTools",
  description: "Convert YAML data to JSON format with our online converter tool",
}

export default function YamlToJsonPage() {
  return (
    <div className="grid place-items-center min-h-screen lg:ml-[var(--sidebar-width)]">
      <div className="w-full max-w-8xl px-8">
        <FormatConverter type="yaml-json" config={conversionConfigs["yaml-json"]} />
      </div>
    </div>
  )
}
