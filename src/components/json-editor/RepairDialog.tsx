"use client";

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Wrench, Check } from 'lucide-react';
import { repairJSON, RepairResult } from '@/lib/json-utils/repair';
import { Editor } from '@monaco-editor/react';
import { useTheme } from 'next-themes';

interface RepairDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    content: string;
    onRepaired: (repairedContent: string) => void;
}

export default function RepairDialog({
    open,
    onOpenChange,
    content,
    onRepaired,
}: RepairDialogProps) {
    const [repairResult, setRepairResult] = useState<RepairResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { theme } = useTheme();

    const handleRepair = () => {
        setError(null);
        try {
            const result = repairJSON(content);
            setRepairResult(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to repair JSON');
        }
    };

    const handleApply = () => {
        if (repairResult?.repaired) {
            onRepaired(repairResult.repaired);
            onOpenChange(false);
        }
    };

    const handleClose = () => {
        setRepairResult(null);
        setError(null);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Wrench className="h-5 w-5" />
                        JSON Repair
                    </DialogTitle>
                    <DialogDescription>
                        Automatically fix common JSON syntax errors like missing quotes, trailing commas, and more.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {!repairResult && (
                        <div>
                            <Button onClick={handleRepair} className="w-full">
                                <Wrench className="h-4 w-4 mr-2" />
                                Repair JSON
                            </Button>
                        </div>
                    )}

                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {repairResult && (
                        <>
                            {repairResult.wasRepaired ? (
                                <Alert className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                                    <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                                    <AlertDescription className="text-green-600 dark:text-green-400">
                                        <div className="font-semibold mb-2">JSON repaired successfully!</div>
                                        <ul className="list-disc list-inside text-sm space-y-1">
                                            {repairResult.changes.map((change, idx) => (
                                                <li key={idx}>{change}</li>
                                            ))}
                                        </ul>
                                    </AlertDescription>
                                </Alert>
                            ) : (
                                <Alert>
                                    <Check className="h-4 w-4" />
                                    <AlertDescription>
                                        Your JSON is already valid. No repairs needed!
                                    </AlertDescription>
                                </Alert>
                            )}

                            <div>
                                <label className="text-sm font-medium mb-2 block">Repaired JSON:</label>
                                <div className="border rounded-lg overflow-hidden">
                                    <Editor
                                        height="300px"
                                        defaultLanguage="json"
                                        value={repairResult.repaired}
                                        theme={theme === 'dark' ? 'vs-dark' : 'light'}
                                        options={{
                                            readOnly: true,
                                            minimap: { enabled: false },
                                            fontSize: 12,
                                            lineNumbers: 'on',
                                            scrollBeyondLastLine: false,
                                            automaticLayout: true,
                                        }}
                                    />
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose}>
                        Cancel
                    </Button>
                    {repairResult?.wasRepaired && (
                        <Button onClick={handleApply}>
                            Apply Repair
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
