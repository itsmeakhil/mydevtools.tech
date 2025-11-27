"use client"

import { useState } from "react"
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion"
import { Copy, Trash2 } from "lucide-react"
import { PasswordEntry } from "@/store/password-store"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { getFaviconUrl, calculatePasswordStrength, getStrengthColor } from "@/lib/password-utils"
import { formatDistanceToNow } from "date-fns"

interface PasswordItemSwipeableProps {
    entry: PasswordEntry
    onCopy: (text: string) => void
    onDelete: (id: string) => void
    onEdit: (entry: PasswordEntry) => void
    onToggleVisibility: (id: string) => void
    isVisible: boolean
}

export function PasswordItemSwipeable({
    entry,
    onCopy,
    onDelete,
    onEdit,
    onToggleVisibility,
    isVisible
}: PasswordItemSwipeableProps) {
    const x = useMotionValue(0)
    const opacityRight = useTransform(x, [50, 100], [0, 1])
    const opacityLeft = useTransform(x, [-50, -100], [0, 1])
    const scaleRight = useTransform(x, [50, 100], [0.8, 1.2])
    const scaleLeft = useTransform(x, [-50, -100], [0.8, 1.2])
    const bgRight = useTransform(x, [0, 100], ["rgba(0,0,0,0)", "rgba(34, 197, 94, 0.2)"]) // Green for copy
    const bgLeft = useTransform(x, [0, -100], ["rgba(0,0,0,0)", "rgba(239, 68, 68, 0.2)"]) // Red for delete

    const handleDragEnd = (_: any, info: PanInfo) => {
        if (info.offset.x > 80) {
            onCopy(entry.password)
        } else if (info.offset.x < -80) {
            onDelete(entry.id)
        }
    }

    return (
        <div className="relative overflow-hidden rounded-xl mb-3">
            {/* Background Actions */}
            <motion.div style={{ opacity: opacityRight, backgroundColor: bgRight }} className="absolute inset-y-0 left-0 w-full flex items-center justify-start pl-6 z-10">
                <motion.div style={{ scale: scaleRight }}>
                    <Copy className="h-6 w-6 text-green-600" />
                </motion.div>
            </motion.div>
            <motion.div style={{ opacity: opacityLeft, backgroundColor: bgLeft }} className="absolute inset-y-0 right-0 w-full flex items-center justify-end pr-6 z-10">
                <motion.div style={{ scale: scaleLeft }}>
                    <Trash2 className="h-6 w-6 text-red-600" />
                </motion.div>
            </motion.div>

            {/* Foreground Card */}
            <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={handleDragEnd}
                style={{ x, backgroundColor: "hsl(var(--card))" }}
                className="relative z-20 bg-card border rounded-xl shadow-sm"
                onClick={() => onEdit(entry)}
            >
                <div className="p-4">
                    <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shrink-0">
                            {entry.url && getFaviconUrl(entry.url) ? (
                                <img
                                    src={getFaviconUrl(entry.url)!}
                                    alt={entry.service}
                                    className="h-6 w-6 object-contain"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                        (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                    }}
                                />
                            ) : null}
                            <span className={cn(entry.url && getFaviconUrl(entry.url) ? "hidden" : "")}>
                                {entry.service.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold truncate">{entry.service}</h3>
                            <p className="text-xs text-muted-foreground truncate">{entry.username}</p>
                            <div className="mt-2 flex items-center gap-2">
                                <div className="h-1 w-16 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className={cn("h-full", getStrengthColor(calculatePasswordStrength(entry.password)))}
                                        style={{ width: `${(calculatePasswordStrength(entry.password) / 5) * 100}%` }}
                                    />
                                </div>
                                <span className="text-[10px] text-muted-foreground">
                                    {formatDistanceToNow(entry.updatedAt, { addSuffix: true })}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
