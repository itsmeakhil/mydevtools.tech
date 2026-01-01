"use client"

import * as React from "react"
import { Send, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { RequestMethod, Collection } from "./types"
import { SaveRequestDialog } from "./collections/save-request-dialog"

interface RequestPanelProps {
    method: RequestMethod
    setMethod: (method: RequestMethod) => void
    url: string
    setUrl: (url: string) => void
    onSend: () => void
    isLoading: boolean
    collections: Collection[]
    onSave: (parentId: string, name: string) => void
    saveDefaultName?: string
    onPaste: (text: string) => void
}

const METHODS: RequestMethod[] = ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"]

export function RequestPanel({
    method,
    setMethod,
    url,
    setUrl,
    onSend,
    isLoading,
    collections,
    onSave,
    saveDefaultName,
    onPaste,
}: RequestPanelProps) {
    return (
        <div className="flex gap-2">
            <Select value={method} onValueChange={(v) => setMethod(v as RequestMethod)}>
                <SelectTrigger className="w-[120px] font-bold">
                    <SelectValue placeholder="Method" />
                </SelectTrigger>
                <SelectContent>
                    {METHODS.map((m) => (
                        <SelectItem key={m} value={m} className="font-medium">
                            {m}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Input
                placeholder="Enter request URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1 font-mono"
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        onSend()
                    }
                }}
                onPaste={(e) => {
                    const text = e.clipboardData.getData("text")
                    if (text.trim().startsWith("curl ")) {
                        e.preventDefault()
                        onPaste(text)
                    }
                }}
            />
            <Button onClick={onSend} disabled={isLoading || !url} className="w-[100px]">
                {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <>
                        <Send className="h-4 w-4 mr-2" />
                        Send
                    </>
                )}
            </Button>
            <SaveRequestDialog
                collections={collections}
                onSave={onSave}
                defaultName={saveDefaultName}
            />
        </div>
    )
}
