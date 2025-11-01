"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Eye, Link2, TrendingUp, Loader2 } from "lucide-react"

interface Stats {
  totalVisits: number
  orphanVisits: number
  shortUrls: number
}

export default function Stats() {
  const [stats, setStats] = useState<Stats>({
    totalVisits: 0,
    orphanVisits: 0,
    shortUrls: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/stats")
        if (!response.ok) {
          throw new Error("Failed to fetch stats")
        }
        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="text-muted-foreground">Loading statistics...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard 
        title="Short URLs" 
        value={stats.shortUrls} 
        icon={Link2}
        description="Links created"
        color="text-blue-600"
        bgColor="bg-blue-500/10"
        borderColor="border-blue-500/20"
      />
      <StatCard 
        title="Total Visits" 
        value={stats.totalVisits} 
        icon={Eye}
        description="All-time clicks"
        color="text-green-600"
        bgColor="bg-green-500/10"
        borderColor="border-green-500/20"
      />
      <StatCard 
        title="Orphan Visits" 
        value={stats.orphanVisits} 
        icon={TrendingUp}
        description="Deleted links"
        color="text-orange-600"
        bgColor="bg-orange-500/10"
        borderColor="border-orange-500/20"
      />
    </div>
  )
}

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  description, 
  color, 
  bgColor, 
  borderColor 
}: { 
  title: string
  value: number
  icon: React.ComponentType<{ className?: string }>
  description: string
  color: string
  bgColor: string
  borderColor: string
}) {
  return (
    <Card className={`border-2 ${borderColor} ${bgColor} transition-all duration-200 hover:shadow-lg hover:scale-[1.02]`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-2 rounded-lg ${bgColor}`}>
            <Icon className={`h-5 w-5 ${color}`} />
          </div>
        </div>
        <div className="space-y-1">
          <div className={`text-4xl font-bold ${color}`}>
            {value.toLocaleString()}
          </div>
          <div className="text-base font-semibold text-foreground">{title}</div>
          <div className="text-xs text-muted-foreground">{description}</div>
        </div>
      </CardContent>
    </Card>
  )
}

