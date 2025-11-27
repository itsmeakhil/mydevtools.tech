"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Import } from "lucide-react"

interface ImportCurlDialogProps {
    onImport: (curl: string) => void
}

export function ImportCurlDialog({ onImport }: ImportCurlDialogProps) {
    const [open, setOpen] = React.useState(false)
    const [curl, setCurl] = React.useState("")

    const handleImport = () => {
        if (curl.trim()) {
            onImport(curl)
            setOpen(false)
            setCurl("")
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <Import className="h-4 w-4" />
                    Import cURL
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                    <DialogTitle>Import cURL</DialogTitle>
                    <DialogDescription>
                        Paste your cURL command below to import it as a new request.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <Textarea
                        placeholder="curl -X POST https://api.example.com/data -d '...'"
                        className="h-[200px] font-mono text-xs"
                        value={curl}
                        onChange={(e) => setCurl(e.target.value)}
                    />
                </div>
                <DialogFooter>
                    <Button onClick={handleImport}>Import</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
