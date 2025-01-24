"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"

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
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl mx-auto">
      <StatCard title="Total Visits" value={stats.totalVisits} />
      <StatCard title="Orphan Visits" value={stats.orphanVisits} />
      <StatCard title="Short URLs" value={stats.shortUrls} />
    </div>
  )
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <Card>
      <CardContent className="p-4 text-center">
        <div className="text-2xl font-bold text-blue-600">{value}</div>
        <div className="text-sm text-gray-600">{title}</div>
      </CardContent>
    </Card>
  )
}

