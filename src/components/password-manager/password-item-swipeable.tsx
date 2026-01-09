"use client"

import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion"
import { Copy, Trash2, ChevronRight, Eye, EyeOff, ExternalLink } from "lucide-react"
import { PasswordEntry } from "@/store/password-store"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getFaviconUrl, calculatePasswordStrength, getStrengthColor } from "@/lib/password-utils"
import { formatDistanceToNow } from "date-fns"
import { useState } from "react"

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
    const [expanded, setExpanded] = useState(false)
    const x = useMotionValue(0)
    const opacityRight = useTransform(x, [30, 80], [0, 1])
    const opacityLeft = useTransform(x, [-30, -80], [0, 1])
    const scaleRight = useTransform(x, [30, 80], [0.8, 1])
    const scaleLeft = useTransform(x, [-30, -80], [0.8, 1])
    const bgRight = useTransform(x, [0, 80], ["rgba(34, 197, 94, 0)", "rgba(34, 197, 94, 0.15)"])
    const bgLeft = useTransform(x, [0, -80], ["rgba(239, 68, 68, 0)", "rgba(239, 68, 68, 0.15)"])

    const strength = calculatePasswordStrength(entry.password)
    const strengthColor = getStrengthColor(strength)

    const handleDragEnd = (_: any, info: PanInfo) => {
        if (info.offset.x > 60) {
            onCopy(entry.password)
        } else if (info.offset.x < -60) {
            onDelete(entry.id)
        }
    }

    const handleTap = () => {
        setExpanded(!expanded)
    }

    return (
        <div className="relative overflow-hidden rounded-2xl mb-2">
            {/* Background Actions */}
            <motion.div
                style={{ opacity: opacityRight, backgroundColor: bgRight }}
                className="absolute inset-y-0 left-0 w-full flex items-center justify-start pl-5 z-10"
            >
                <motion.div style={{ scale: scaleRight }} className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
                        <Copy className="h-5 w-5 text-green-600" />
                    </div>
                    <span className="text-xs font-medium text-green-600">Copy</span>
                </motion.div>
            </motion.div>
            <motion.div
                style={{ opacity: opacityLeft, backgroundColor: bgLeft }}
                className="absolute inset-y-0 right-0 w-full flex items-center justify-end pr-5 z-10"
            >
                <motion.div style={{ scale: scaleLeft }} className="flex items-center gap-2">
                    <span className="text-xs font-medium text-red-600">Delete</span>
                    <div className="h-10 w-10 rounded-full bg-red-500/20 flex items-center justify-center">
                        <Trash2 className="h-5 w-5 text-red-600" />
                    </div>
                </motion.div>
            </motion.div>

            {/* Foreground Card */}
            <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.15}
                onDragEnd={handleDragEnd}
                style={{ x }}
                className="relative z-20 bg-card active:bg-muted/50 transition-colors"
            >
                {/* Main Item Row */}
                <div
                    className="flex items-center gap-3 p-4 cursor-pointer"
                    onClick={handleTap}
                >
                    {/* Favicon/Icon */}
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center text-primary font-semibold text-lg shrink-0 shadow-sm ring-1 ring-inset ring-primary/10">
                        {entry.url && getFaviconUrl(entry.url) ? (
                            <img
                                src={getFaviconUrl(entry.url)!}
                                alt={entry.service}
                                className="h-7 w-7 object-contain rounded-lg"
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

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-[15px] truncate leading-tight">{entry.service}</h3>
                        <p className="text-[13px] text-muted-foreground truncate mt-0.5">{entry.username}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                            {/* Strength indicator */}
                            <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map((level) => (
                                    <div
                                        key={level}
                                        className={cn(
                                            "h-1 w-3 rounded-full transition-colors",
                                            level <= strength ? strengthColor : "bg-muted"
                                        )}
                                    />
                                ))}
                            </div>
                            <span className="text-[10px] text-muted-foreground">
                                {formatDistanceToNow(entry.updatedAt, { addSuffix: true })}
                            </span>
                        </div>
                    </div>

                    {/* Chevron */}
                    <motion.div
                        animate={{ rotate: expanded ? 90 : 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <ChevronRight className="h-5 w-5 text-muted-foreground/50" />
                    </motion.div>
                </div>

                {/* Expanded Actions */}
                <motion.div
                    initial={false}
                    animate={{
                        height: expanded ? "auto" : 0,
                        opacity: expanded ? 1 : 0
                    }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="overflow-hidden"
                >
                    <div className="px-4 pb-4 pt-0">
                        {/* Password display */}
                        <div className="flex items-center gap-2 bg-muted/40 p-3 rounded-xl mb-3">
                            <div className="flex-1 font-mono text-sm truncate">
                                {isVisible ? entry.password : "••••••••••••"}
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 shrink-0"
                                onClick={(e) => { e.stopPropagation(); onToggleVisibility(entry.id); }}
                            >
                                {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 shrink-0"
                                onClick={(e) => { e.stopPropagation(); onCopy(entry.password); }}
                            >
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Action buttons */}
                        <div className="grid grid-cols-3 gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-10 text-xs"
                                onClick={(e) => { e.stopPropagation(); onEdit(entry); }}
                            >
                                Edit
                            </Button>
                            {entry.url && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-10 text-xs"
                                    onClick={(e) => { e.stopPropagation(); window.open(entry.url, '_blank'); }}
                                >
                                    <ExternalLink className="h-3.5 w-3.5 mr-1" />
                                    Open
                                </Button>
                            )}
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-10 text-xs text-destructive hover:text-destructive"
                                onClick={(e) => { e.stopPropagation(); onDelete(entry.id); }}
                            >
                                Delete
                            </Button>
                        </div>

                        {/* Notes if present */}
                        {entry.notes && (
                            <div className="mt-3 p-3 bg-muted/30 rounded-xl text-xs text-muted-foreground">
                                {entry.notes}
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </div>
    )
}

