import { FormatConverter } from "../../../components/format-converter"
import { conversionConfigs } from "../types/converter"

export const metadata = {
  title: "XML to JSON Converter - MyDevTools",
  description: "Convert XML data to JSON format with our online converter tool",
}

export default function XmlToJsonPage() {
  return (
    <div className="grid place-items-center min-h-screen lg:ml-[var(--sidebar-width)]">
      <div className="w-full max-w-8xl px-8">
        <FormatConverter type="xml-json" config={conversionConfigs["xml-json"]} />
      </div>
    </div>
  )
}
