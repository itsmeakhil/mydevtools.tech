"use client"

import * as React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CodeEditor from "@/components/ui/code-editor"
import { ApiResponse } from "./types"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ResponsePanelProps {
    response: ApiResponse | null
}

export function ResponsePanel({ response }: ResponsePanelProps) {
    if (!response) {
        return (
            <div className="h-full flex items-center justify-center text-muted-foreground border rounded-md min-h-[300px] bg-muted/10">
                Enter a URL and click Send to get a response
            </div>
        )
    }

    const isSuccess = response.status >= 200 && response.status < 300
    const isError = response.status >= 400

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 border rounded-md bg-card">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">Status:</span>
                    <Badge variant={isSuccess ? "default" : isError ? "destructive" : "secondary"}>
                        {response.status} {response.statusText}
                    </Badge>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">Time:</span>
                    <span className="text-sm font-mono">{response.time}ms</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">Size:</span>
                    <span className="text-sm font-mono">{(response.size / 1024).toFixed(2)} KB</span>
                </div>
            </div>

            <Tabs defaultValue="body" className="w-full">
                <TabsList className="w-full justify-start">
                    <TabsTrigger value="body">Body</TabsTrigger>
                    <TabsTrigger value="headers">Headers</TabsTrigger>
                </TabsList>
                <div className="mt-4 border rounded-md overflow-hidden min-h-[400px]">
                    <TabsContent value="body" className="mt-0 h-[400px]">
                        <CodeEditor
                            value={response.body}
                            language="json"
                            readOnly
                        />
                    </TabsContent>
                    <TabsContent value="headers" className="mt-0 h-[400px]">
                        <ScrollArea className="h-full p-4">
                            <div className="grid grid-cols-[auto,1fr] gap-x-4 gap-y-2 text-sm">
                                {Object.entries(response.headers).map(([key, value]) => (
                                    <React.Fragment key={key}>
                                        <div className="font-medium text-muted-foreground">{key}:</div>
                                        <div className="font-mono break-all">{value}</div>
                                    </React.Fragment>
                                ))}
                            </div>
                        </ScrollArea>
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    )
}
