import { FormatConverter } from "../../../components/format-converter"
import { conversionConfigs } from "../types/converter"

export const metadata = {
  title: "JSON to YAML Converter - MyDevTools",
  description: "Convert JSON data to YAML format with our online converter tool",
}

export default function JsonToYamlPage() {
  return (
    <div className="grid justify-items-center min-h-auto align-items: normal mt-4">
      <div className="w-full max-w-8xl px-8">
        <FormatConverter type="json-yaml" config={conversionConfigs["json-yaml"]} />
      </div>
    </div>
  )
}
