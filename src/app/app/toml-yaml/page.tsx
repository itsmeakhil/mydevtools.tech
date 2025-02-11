import { FormatConverter } from "../../../components/format-converter"
import { conversionConfigs } from "../types/converter"

export const metadata = {
  title: "TOML to YAML Converter - MyDevTools",
  description: "Convert TOML data to YAML format with our online converter tool",
}

export default function TomlToYamlPage() {
  return (
    <div className="grid justify-items-center min-h-auto align-items: normal mt-8 ">
      <div className="w-full max-w-8xl px-8">
        <FormatConverter type="toml-yaml" config={conversionConfigs["toml-yaml"]} />
      </div>
    </div>
  )
}
