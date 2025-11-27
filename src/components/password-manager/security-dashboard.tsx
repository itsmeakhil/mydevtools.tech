"use client"

import { useMemo } from "react"
import { usePasswordStore } from "@/store/password-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { calculatePasswordStrength } from "@/lib/password-utils"
import { ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2, Lock } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

export function SecurityDashboard() {
    const { passwords } = usePasswordStore()

    const metrics = useMemo(() => {
        const total = passwords.length
        if (total === 0) return null

        let weakCount = 0
        let mediumCount = 0
        let strongCount = 0
        const reusedMap = new Map<string, number>()
        let reusedCount = 0

        passwords.forEach(p => {
            const strength = calculatePasswordStrength(p.password)
            if (strength <= 2) weakCount++
            else if (strength <= 3) mediumCount++
            else strongCount++

            reusedMap.set(p.password, (reusedMap.get(p.password) || 0) + 1)
        })

        reusedMap.forEach(count => {
            if (count > 1) reusedCount += count
        })

        // Calculate Health Score (0-100)
        // Base score: 100
        // Deduct 10 for each weak password
        // Deduct 5 for each medium password
        // Deduct 15 for each reused password
        // (Simplified logic for demo)
        let score = 100
        score -= (weakCount * 10)
        score -= (mediumCount * 2) // Less penalty for medium
        score -= (reusedCount * 5)

        // Ensure score is within 0-100
        score = Math.max(0, Math.min(100, score))

        return {
            total,
            weakCount,
            mediumCount,
            strongCount,
            reusedCount,
            score
        }
    }, [passwords])

    if (!metrics) return null

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-green-500"
        if (score >= 50) return "text-yellow-500"
        return "text-red-500"
    }

    const getScoreLabel = (score: number) => {
        if (score >= 80) return "Excellent"
        if (score >= 50) return "Good"
        if (score >= 30) return "Fair"
        return "Critical"
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card className="col-span-full lg:col-span-1 bg-card/50 backdrop-blur-sm border-muted/60">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Vault Health</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div className={cn("text-3xl font-bold", getScoreColor(metrics.score))}>
                            {metrics.score}
                            <span className="text-sm font-normal text-muted-foreground ml-1">/ 100</span>
                        </div>
                        {metrics.score >= 80 ? (
                            <ShieldCheck className="h-8 w-8 text-green-500 opacity-80" />
                        ) : metrics.score >= 50 ? (
                            <ShieldAlert className="h-8 w-8 text-yellow-500 opacity-80" />
                        ) : (
                            <AlertTriangle className="h-8 w-8 text-red-500 opacity-80" />
                        )}
                    </div>
                    <div className="mt-3 text-xs font-medium text-muted-foreground">
                        Status: <span className={getScoreColor(metrics.score)}>{getScoreLabel(metrics.score)}</span>
                    </div>
                    <Progress value={metrics.score} className={cn("h-1.5 mt-3",
                        metrics.score >= 80 ? "bg-green-100 dark:bg-green-900/20 [&>div]:bg-green-500" :
                            metrics.score >= 50 ? "bg-yellow-100 dark:bg-yellow-900/20 [&>div]:bg-yellow-500" :
                                "bg-red-100 dark:bg-red-900/20 [&>div]:bg-red-500"
                    )} />
                </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-muted/60">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Passwords</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{metrics.total}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Active entries in your vault
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                        <Lock className="h-3 w-3" /> Protected
                    </div>
                </CardContent>
            </Card>

            <Card className={cn("bg-card/50 backdrop-blur-sm border-muted/60", metrics.weakCount > 0 && "border-red-500/20 bg-red-500/5")}>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Weak Passwords</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className={cn("text-2xl font-bold", metrics.weakCount > 0 ? "text-red-500" : "text-foreground")}>
                        {metrics.weakCount}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Passwords needing improvement
                    </p>
                    {metrics.weakCount === 0 && (
                        <div className="mt-4 flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                            <CheckCircle2 className="h-3 w-3" /> All good
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card className={cn("bg-card/50 backdrop-blur-sm border-muted/60", metrics.reusedCount > 0 && "border-yellow-500/20 bg-yellow-500/5")}>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Reused Passwords</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className={cn("text-2xl font-bold", metrics.reusedCount > 0 ? "text-yellow-500" : "text-foreground")}>
                        {metrics.reusedCount}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Passwords used multiple times
                    </p>
                    {metrics.reusedCount === 0 && (
                        <div className="mt-4 flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                            <CheckCircle2 className="h-3 w-3" /> Unique
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
