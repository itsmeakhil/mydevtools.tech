"use client"

import * as React from "react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { FormatConverter } from "@/components/format-converter"
import { JsonToCsv } from "@/components/json-to-csv"
import { CsvToJson } from "@/components/csv-to-json"
import { conversionConfigs, ConversionType } from "../types/converter"

const CONVERTER_OPTIONS = [
    { value: "json-xml", label: "JSON to XML" },
    { value: "xml-json", label: "XML to JSON" },
    { value: "json-yaml", label: "JSON to YAML" },
    { value: "yaml-json", label: "YAML to JSON" },
    { value: "json-toml", label: "JSON to TOML" },
    { value: "toml-json", label: "TOML to JSON" },
    { value: "yaml-toml", label: "YAML to TOML" },
    { value: "toml-yaml", label: "TOML to YAML" },
    { value: "json-csv", label: "JSON to CSV" },
    { value: "csv-json", label: "CSV to JSON" },
] as const

type ConverterOption = typeof CONVERTER_OPTIONS[number]["value"]

export default function ConvertersPage() {
    const [selectedConverter, setSelectedConverter] = React.useState<ConverterOption>("json-xml")

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-8">
            <div className="max-w-5xl mx-auto space-y-6">
                <div className="flex flex-col space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Converters</h1>
                    <p className="text-muted-foreground">
                        Convert between different data formats easily.
                    </p>
                </div>

                <div className="w-full max-w-xs">
                    <Select
                        value={selectedConverter}
                        onValueChange={(value) => setSelectedConverter(value as ConverterOption)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select converter" />
                        </SelectTrigger>
                        <SelectContent>
                            {CONVERTER_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {selectedConverter === "json-csv" ? (
                    <JsonToCsv />
                ) : selectedConverter === "csv-json" ? (
                    <CsvToJson />
                ) : (
                    <FormatConverter
                        type={selectedConverter as ConversionType}
                        config={conversionConfigs[selectedConverter as ConversionType]}
                    />
                )}
            </div>
        </div>
    )
}
