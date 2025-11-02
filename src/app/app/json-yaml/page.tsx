import { FormatConverter } from "../../../components/format-converter"
import { conversionConfigs } from "../types/converter"

export const metadata = {
  title: "JSON to YAML Converter - MyDevTools",
  description: "Convert JSON data to YAML format with our online converter tool",
}

export default function JsonToYamlPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <FormatConverter type="json-yaml" config={conversionConfigs["json-yaml"]} />
      </div>
    </div>
  )
}
