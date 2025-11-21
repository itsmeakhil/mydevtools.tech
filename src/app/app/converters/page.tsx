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
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header Section */}
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl shadow-sm mb-2">
                        <ArrowLeftRight className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                            Format Converters
                        </h1>
                        <p className="text-muted-foreground mt-3 text-lg max-w-2xl mx-auto">
                            Seamlessly convert between JSON, XML, YAML, TOML, and CSV formats
                        </p>
                    </div>
                </div>

                {/* Converter Selector Card */}
                <Card className="border-2 shadow-lg bg-gradient-to-br from-card to-card/50 backdrop-blur">
                    <div className="p-6">
                        <div className="flex flex-col md:flex-row items-center gap-4">
                            <div className="flex-1 w-full md:w-auto">
                                <label className="text-sm font-semibold text-muted-foreground mb-2 block">
                                    Select Conversion Type
                                </label>
                                <Select
                                    value={selectedConverter}
                                    onValueChange={(value) => setSelectedConverter(value as ConverterOption)}
                                >
                                    <SelectTrigger className="h-12 text-base border-2 hover:border-primary/50 transition-colors">
                                        <SelectValue placeholder="Select converter" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CONVERTER_OPTIONS.map((option) => (
                                            <SelectItem
                                                key={option.value}
                                                value={option.value}
                                                className="text-base py-3"
                                            >
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="hidden md:flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full">
                                <ArrowLeftRight className="h-5 w-5 text-primary" />
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
