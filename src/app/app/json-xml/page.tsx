import { FormatConverter } from "../components/format-converter"
import { conversionConfigs } from "../types/converter"

export const metadata = {
  title: "JSON to XML Converter - MyDevTools",
  description: "Convert JSON data to XML format with our online converter tool",
}

export default function JsonToXmlPage() {
  return (
    <div className="grid place-items-center min-h-screen lg:ml-[var(--sidebar-width)]">
      <div className="w-full max-w-8xl px-8">
      <FormatConverter type="json-xml" config={conversionConfigs["json-xml"]} />
    </div>
    </div>
  )
}
