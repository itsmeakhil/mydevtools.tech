import { xml2js, js2xml } from "xml-js"
import yaml from "js-yaml"
import TOML from "@iarna/toml"

declare module "@iarna/toml" {
  interface TOML {
    stringify(obj: Record<string, unknown>): string;
  }
}

export class ConversionError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "ConversionError"
  }
}

export const converters = {
  "json-xml": (input: string) => {
    try {
      const jsonObj = JSON.parse(input)
      return js2xml(jsonObj, { compact: true, spaces: 2 })
    } catch (error) {
      throw new ConversionError(error instanceof Error ? error.message : "Invalid JSON input")
    }
  },

  "xml-json": (input: string) => {
    try {
      const jsonObj = xml2js(input, { compact: true })
      return JSON.stringify(jsonObj, null, 2)
    } catch (error) {
      throw new ConversionError(error instanceof Error ? error.message : "Invalid XML input")
    }
  },

  "json-yaml": (input: string) => {
    try {
      const jsonObj = JSON.parse(input)
      return yaml.dump(jsonObj)
    } catch (error) {
      throw new ConversionError(error instanceof Error ? error.message : "Invalid JSON input")
    }
  },

  "yaml-json": (input: string) => {
    try {
      const yamlObj = yaml.load(input) as Record<string, unknown>
      return JSON.stringify(yamlObj, null, 2)
    } catch (error) {
      throw new ConversionError(error instanceof Error ? error.message : "Invalid YAML input")
    }
  },

  "json-toml": (input: string) => {
    try {
      const jsonObj = JSON.parse(input)
      return TOML.stringify(jsonObj)
    } catch (error) {
      throw new ConversionError(error instanceof Error ? error.message : "Invalid JSON input")
    }
  },

  "yaml-toml": (input: string) => {
    try {
      const yamlObj = yaml.load(input) as Record<string, unknown>
      return TOML.stringify(yamlObj as Parameters<typeof TOML.stringify>[0])
    } catch (error) {
      throw new ConversionError(error instanceof Error ? error.message : "Invalid YAML input")
    }
  },

  "toml-json": (input: string) => {
    try {
      const tomlObj = TOML.parse(input)
      return JSON.stringify(tomlObj, null, 2)
    } catch (error) {
      throw new ConversionError(error instanceof Error ? error.message : "Invalid TOML input")
    }
  },

  "toml-yaml": (input: string) => {
    try {
      const tomlObj = TOML.parse(input)
      return yaml.dump(tomlObj)
    } catch (error) {
      throw new ConversionError(error instanceof Error ? error.message : "Invalid TOML input")
    }
  },

  // Add other conversion functions
} as const
