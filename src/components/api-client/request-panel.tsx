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
import { RequestMethod } from "./types"

interface RequestPanelProps {
    method: RequestMethod
    setMethod: (method: RequestMethod) => void
    url: string
    setUrl: (url: string) => void
    onSend: () => void
    isLoading: boolean
}

const METHODS: RequestMethod[] = ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"]

export function RequestPanel({
    method,
    setMethod,
    url,
    setUrl,
    onSend,
    isLoading,
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
        </div>
    )
}
