import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function PopularTags() {
  // Mock data - in a real app this would come from an API or state management
  const tags = [
    { name: "development", count: 45 },
    { name: "design", count: 32 },
    { name: "resources", count: 28 },
    { name: "tools", count: 24 },
    { name: "tutorials", count: 19 },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Popular Tags</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge key={tag.name} variant="outline" className="text-sm py-1.5">
              {tag.name} ({tag.count})
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

