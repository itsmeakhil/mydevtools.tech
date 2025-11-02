import { FormatConverter } from "../../../components/format-converter"
import { conversionConfigs } from "../types/converter"

export const metadata = {
  title: "XML to JSON Converter - MyDevTools",
  description: "Convert XML data to JSON format with our online converter tool",
}

export default function XmlToJsonPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <FormatConverter type="xml-json" config={conversionConfigs["xml-json"]} />
      </div>
    </div>
  )
}
