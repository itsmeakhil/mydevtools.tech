import { FormatConverter } from "../../../components/format-converter"
import { conversionConfigs } from "../types/converter"

export const metadata = {
  title: "TOML to JSON Converter - MyDevTools",
  description: "Convert TOML data to JSON format with our online converter tool",
}

export default function TomlToJsonPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <FormatConverter type="toml-json" config={conversionConfigs["toml-json"]} />
      </div>
    </div>
  )
}
