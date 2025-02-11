import { FormatConverter } from "../../../components/format-converter"
import { conversionConfigs } from "../types/converter"

export const metadata = {
  title: "YAML to JSON Converter - MyDevTools",
  description: "Convert YAML data to JSON format with our online converter tool",
}

export default function YamlToJsonPage() {
  return (
    <div className="grid justify-items-center min-h-auto align-items: normal mt-8 ">
      <div className="w-full max-w-8xl px-8">
        <FormatConverter 
          type="yaml-json" 
          config={conversionConfigs["yaml-json"]} 
        />
      </div>
    </div>
  )
}
