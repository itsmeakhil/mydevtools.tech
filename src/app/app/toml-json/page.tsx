import { FormatConverter } from "../../../components/format-converter"
import { conversionConfigs } from "../types/converter"

export const metadata = {
  title: "TOML to JSON Converter - MyDevTools",
  description: "Convert TOML data to JSON format with our online converter tool",
}

export default function TomlToJsonPage() {
  return (
    <div className="grid place-items-center min-h-screen lg:ml-[var(--sidebar-width)]">
      <div className="w-full max-w-8xl px-8">
        <FormatConverter type="toml-json" config={conversionConfigs["toml-json"]} />
      </div>
    </div>
  )
}
