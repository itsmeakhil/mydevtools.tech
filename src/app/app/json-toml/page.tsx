import { FormatConverter } from "../../../components/format-converter"
import { conversionConfigs } from "../types/converter"

export const metadata = {
  title: "JSON to TOML Converter - MyDevTools",
  description: "Convert JSON data to TOML format with our online converter tool",
}

export default function JsonToTomlPage() {
  return (
    <div className="grid justify-items-center min-h-auto align-items: normal mt-4">
      <div className="w-full max-w-8xl px-8 ">
        <FormatConverter type="json-toml" config={conversionConfigs["json-toml"]} />
      </div>
    </div>
  )
}
