import { FormatConverter } from "../../../components/format-converter"
import { conversionConfigs } from "../types/converter"

export const metadata = {
  title: "YAML to JSON Converter - MyDevTools",
  description: "Convert YAML data to JSON format with our online converter tool",
}

export default function YamlToJsonPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <FormatConverter 
          type="yaml-json" 
          config={conversionConfigs["yaml-json"]} 
        />
      </div>
    </div>
  )
}
