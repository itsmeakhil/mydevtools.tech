import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function CollectionsSection() {
  // Mock data - in a real app this would come from an API or state management
  const collections = [
    {
      id: "1",
      name: "Development",
      description: "Programming resources and tools",
      count: 42,
    },
    {
      id: "2",
      name: "Design",
      description: "UI/UX resources and inspiration",
      count: 28,
    },
    {
      id: "3",
      name: "Reading List",
      description: "Articles to read later",
      count: 15,
    },
  ]

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Collections</h2>
        <p className="text-muted-foreground">Your organized bookmark collections</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {collections.map((collection) => (
          <Card key={collection.id} className="overflow-hidden">
            <CardHeader className="flex flex-row items-start justify-between pb-2">
              <div>
                <CardTitle>{collection.name}</CardTitle>
                <CardDescription>{collection.description}</CardDescription>
              </div>
              <Badge variant="secondary" className="ml-2">
                {collection.count}
              </Badge>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  )
}

