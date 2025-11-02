import { FormatConverter } from "../../../components/format-converter"
import { conversionConfigs } from "../types/converter"

export const metadata = {
  title: "JSON to TOML Converter - MyDevTools",
  description: "Convert JSON data to TOML format with our online converter tool",
}

export default function JsonToTomlPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <FormatConverter type="json-toml" config={conversionConfigs["json-toml"]} />
      </div>
    </div>
  )
}
