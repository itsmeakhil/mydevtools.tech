"use client"

import * as React from "react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { ArrowLeftRight } from "lucide-react"
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
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-3 md:p-4 lg:p-6">
            <div className="max-w-6xl mx-auto space-y-4">
                {/* Header Section */}
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-xl shadow-sm">
                        <ArrowLeftRight className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                            Format Converters
                        </h1>
                        <p className="text-muted-foreground mt-1 text-sm max-w-xl mx-auto">
                            Seamlessly convert between JSON, XML, YAML, TOML, and CSV formats
                        </p>
                    </div>
                </div>

                {/* Converter Selector Card */}
                <Card className="border shadow-md bg-gradient-to-br from-card to-card/50 backdrop-blur">
                    <div className="p-4">
                        <div className="flex flex-col md:flex-row items-center gap-3">
                            <div className="flex-1 w-full md:w-auto">
                                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                                    Select Conversion Type
                                </label>
                                <Select
                                    value={selectedConverter}
                                    onValueChange={(value) => setSelectedConverter(value as ConverterOption)}
                                >
                                    <SelectTrigger className="h-9 text-sm border hover:border-primary/50 transition-colors">
                                        <SelectValue placeholder="Select converter" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CONVERTER_OPTIONS.map((option) => (
                                            <SelectItem
                                                key={option.value}
                                                value={option.value}
                                                className="text-sm"
                                            >
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="hidden md:flex items-center justify-center w-9 h-9 bg-primary/10 rounded-full">
                                <ArrowLeftRight className="h-4 w-4 text-primary" />
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Converter Component */}
                <div className="animate-in fade-in duration-300">
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
        </div>
    )
}
