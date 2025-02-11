import { FormatConverter } from "../../../components/format-converter"
import { conversionConfigs } from "../types/converter"

export const metadata = {
  title: "YAML to TOML Converter - MyDevTools",
  description: "Convert YAML data to TOML format with our online converter tool",
}

export default function YamlToTomlPage() {
  return (
    <div className="grid justify-items-center min-h-auto align-items: normal mt-8 ">
      <div className="w-full max-w-8xl px-8">
        <FormatConverter type="yaml-toml" config={conversionConfigs["yaml-toml"]} />
      </div>
    </div>
  )
}
