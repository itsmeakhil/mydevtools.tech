export type ConversionType =
  | "json-xml"
  | "xml-json"
  | "json-yaml"
  | "json-toml"
  | "yaml-json"
  | "yaml-toml"
  | "toml-json"
  | "toml-yaml"

export interface ConversionConfig {
  title: string
  description: string
  inputLabel: string
  outputLabel: string
  inputPlaceholder: string
  outputPlaceholder: string
}

export const conversionConfigs: Record<ConversionType, ConversionConfig> = {
  "json-xml": {
    title: "JSON to XML",
    description: "Convert JSON data to XML format",
    inputLabel: "Your JSON content",
    outputLabel: "Converted XML",
    inputPlaceholder: '{"example": "Enter your JSON here"}',
    outputPlaceholder: "<example>Enter your JSON to see the XML conversion</example>",
  },
  "xml-json": {
    title: "XML to JSON",
    description: "Convert XML data to JSON format",
    inputLabel: "Your XML content",
    outputLabel: "Converted JSON",
    inputPlaceholder: "<example>Enter your XML here</example>",
    outputPlaceholder: '{"example": "Enter your XML to see the JSON conversion"}',
  },
  "json-yaml": {
    title: "JSON to YAML",
    description: "Convert JSON data to YAML format",
    inputLabel: "Your JSON content",
    outputLabel: "Converted YAML",
    inputPlaceholder: '{"example": "Enter your JSON here"}',
    outputPlaceholder: "example: Enter your JSON to see the YAML conversion",
  },
  "json-toml": {
    title: "JSON to TOML",
    description: "Convert JSON data to TOML format",
    inputLabel: "Your JSON content",
    outputLabel: "Converted TOML",
    inputPlaceholder: '{"example": "Enter your JSON here"}',
    outputPlaceholder: 'example = "Enter your JSON to see the TOML conversion"',
  },
  "yaml-json": {
    title: "YAML to JSON",
    description: "Convert YAML data to JSON format",
    inputLabel: "Your YAML content",
    outputLabel: "Converted JSON",
    inputPlaceholder: "example: Enter your YAML here",
    outputPlaceholder: '{"example": "Enter your YAML to see the JSON conversion"}',
  },
  "yaml-toml": {
    title: "YAML to TOML",
    description: "Convert YAML data to TOML format",
    inputLabel: "Your YAML content",
    outputLabel: "Converted TOML",
    inputPlaceholder: "example: Enter your YAML here",
    outputPlaceholder: 'example = "Enter your YAML to see the TOML conversion"',
  },
  "toml-json": {
    title: "TOML to JSON",
    description: "Convert TOML data to JSON format",
    inputLabel: "Your TOML content",
    outputLabel: "Converted JSON",
    inputPlaceholder: 'example = "Enter your TOML here"',
    outputPlaceholder: '{"example": "Enter your TOML to see the JSON conversion"}',
  },
  "toml-yaml": {
    title: "TOML to YAML",
    description: "Convert TOML data to YAML format",
    inputLabel: "Your TOML content",
    outputLabel: "Converted YAML",
    inputPlaceholder: 'example = "Enter your TOML here"',
    outputPlaceholder: "example: Enter your TOML to see the YAML conversion",
  },
} as const

