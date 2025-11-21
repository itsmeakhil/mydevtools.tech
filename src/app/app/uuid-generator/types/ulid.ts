export type ULIDFormat = "raw" | "json"

export interface GeneratedULID {
    id: string
}

export interface ULIDGeneratorProps {
    initialQuantity?: number
}
