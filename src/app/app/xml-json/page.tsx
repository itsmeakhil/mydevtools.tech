import { FormatConverter } from "../../../components/format-converter"
import { conversionConfigs } from "../types/converter"

export const metadata = {
  title: "XML to JSON Converter - MyDevTools",
  description: "Convert XML data to JSON format with our online converter tool",
}

export default function XmlToJsonPage() {
  return (
    <div className="grid justify-items-center min-h-auto align-items: normal mt-4 ">
      <div className="w-full max-w-8xl px-8">
        <FormatConverter type="xml-json" config={conversionConfigs["xml-json"]} />
      </div>
    </div>
  )
}
