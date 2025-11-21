"use client";

import { useMemo } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, ArrowLeftRight } from 'lucide-react';
import { diffLines } from 'diff';

interface CompareDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    leftContent: string;
    rightContent: string;
}

export default function CompareDialog({
    open,
    onOpenChange,
    leftContent,
    rightContent,
}: CompareDialogProps) {
    const comparison = useMemo(() => {
        if (!leftContent && !rightContent) {
            return { error: 'Both panels are empty' };
        }

        if (!leftContent) {
            return { error: 'Left panel is empty' };
        }

        if (!rightContent) {
            return { error: 'Right panel is empty' };
        }

        // Format both JSONs for better comparison
        let formattedLeft = leftContent;
        let formattedRight = rightContent;

        try {
            const leftParsed = JSON.parse(leftContent);
            formattedLeft = JSON.stringify(leftParsed, null, 2);
        } catch (e) {
            // Keep original if parsing fails
        }

        try {
            const rightParsed = JSON.parse(rightContent);
            formattedRight = JSON.stringify(rightParsed, null, 2);
        } catch (e) {
            // Keep original if parsing fails
        }

        const diff = diffLines(formattedLeft, formattedRight);

        let addedLines = 0;
        let removedLines = 0;
        let unchangedLines = 0;

        diff.forEach(part => {
            const lineCount = part.value.split('\n').length - 1;
            if (part.added) {
                addedLines += lineCount;
            } else if (part.removed) {
                removedLines += lineCount;
            } else {
                unchangedLines += lineCount;
            }
        });

        const identical = addedLines === 0 && removedLines === 0;

        return {
            diff,
            stats: {
                addedLines,
                removedLines,
                unchangedLines,
                identical,
            },
        };
    }, [leftContent, rightContent]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ArrowLeftRight className="h-5 w-5" />
                        JSON Comparison
                    </DialogTitle>
                    <DialogDescription>
                        Compare JSON between left and right panels
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto">
                    {'error' in comparison ? (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{comparison.error}</AlertDescription>
                        </Alert>
                    ) : comparison.stats.identical ? (
                        <Alert className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                            <AlertCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                            <AlertDescription className="text-green-600 dark:text-green-400">
                                <div className="font-semibold">Both JSONs are identical!</div>
                                <div className="text-sm mt-1">No differences found.</div>
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <>
                            {/* Stats */}
                            <div className="mb-4 p-3 bg-muted rounded-lg flex gap-6 text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                                    <span><strong>{comparison.stats.addedLines}</strong> lines added</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                                    <span><strong>{comparison.stats.removedLines}</strong> lines removed</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-gray-400 rounded"></div>
                                    <span><strong>{comparison.stats.unchangedLines}</strong> lines unchanged</span>
                                </div>
                            </div>

                            {/* Diff View */}
                            <div className="border rounded-lg overflow-hidden">
                                <div className="bg-muted px-3 py-2 text-sm font-semibold border-b">
                                    Differences
                                </div>
                                <div className="font-mono text-xs bg-background max-h-[500px] overflow-y-auto">
                                    {comparison.diff.map((part, index) => {
                                        if (!part.value.trim()) return null;

                                        const lines = part.value.split('\n').filter(line => line);

                                        return (
                                            <div key={index}>
                                                {lines.map((line, lineIndex) => (
                                                    <div
                                                        key={`${index}-${lineIndex}`}
                                                        className={`px-3 py-0.5 ${part.added
                                                                ? 'bg-green-100 dark:bg-green-950/30 text-green-800 dark:text-green-300 border-l-2 border-green-500'
                                                                : part.removed
                                                                    ? 'bg-red-100 dark:bg-red-950/30 text-red-800 dark:text-red-300 border-l-2 border-red-500'
                                                                    : 'text-muted-foreground'
                                                            }`}
                                                    >
                                                        <span className="select-none mr-4 text-muted-foreground">
                                                            {part.added ? '+ ' : part.removed ? '- ' : '  '}
                                                        </span>
                                                        {line}
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
