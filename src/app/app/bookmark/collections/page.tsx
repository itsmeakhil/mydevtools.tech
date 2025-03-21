"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  PlusIcon,
  SearchIcon,
  MoreHorizontalIcon,
  PencilIcon,
  TrashIcon,
  StarIcon,
  ExternalLinkIcon,
  ArrowRightIcon,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"

// Sample collections data
const collections = [
  {
    id: "1",
    title: "Development",
    description: "Programming resources and tools",
    bookmarkCount: 42,
    isQuickAccess: true,
    createdAt: "2023-10-15T10:30:00Z",
    color: "bg-blue-500",
    previewLinks: [
      {
        title: "GitHub - Your coding home",
        url: "https://github.com",
        domain: "github.com",
        favicon: "https://github.githubassets.com/favicons/favicon.svg",
      },
      {
        title: "MDN Web Docs",
        url: "https://developer.mozilla.org",
        domain: "developer.mozilla.org",
        favicon: "/placeholder.svg?height=16&width=16",
      },
      {
        title: "Stack Overflow",
        url: "https://stackoverflow.com",
        domain: "stackoverflow.com",
        favicon: "/placeholder.svg?height=16&width=16",
      },
    ],
  },
  {
    id: "2",
    title: "Design",
    description: "UI/UX resources and inspiration",
    bookmarkCount: 28,
    isQuickAccess: true,
    createdAt: "2023-10-20T14:20:00Z",
    color: "bg-purple-500",
    previewLinks: [
      {
        title: "Dribbble - Design Inspiration",
        url: "https://dribbble.com",
        domain: "dribbble.com",
        favicon: "/placeholder.svg?height=16&width=16",
      },
      {
        title: "Figma - Design Tool",
        url: "https://figma.com",
        domain: "figma.com",
        favicon: "/placeholder.svg?height=16&width=16",
      },
      {
        title: "Behance - Creative Showcase",
        url: "https://behance.net",
        domain: "behance.net",
        favicon: "/placeholder.svg?height=16&width=16",
      },
    ],
  },
  {
    id: "3",
    title: "Reading",
    description: "Articles to read later",
    bookmarkCount: 15,
    isQuickAccess: true,
    createdAt: "2023-10-25T09:15:00Z",
    color: "bg-green-500",
    previewLinks: [
      {
        title: "The Future of Web Development",
        url: "https://medium.com",
        domain: "medium.com",
        favicon: "/placeholder.svg?height=16&width=16",
      },
      {
        title: "CSS Architecture Best Practices",
        url: "https://css-tricks.com",
        domain: "css-tricks.com",
        favicon: "/placeholder.svg?height=16&width=16",
      },
      {
        title: "JavaScript Performance Tips",
        url: "https://dev.to",
        domain: "dev.to",
        favicon: "/placeholder.svg?height=16&width=16",
      },
    ],
  },
  {
    id: "4",
    title: "Productivity",
    description: "Tools and resources for staying productive",
    bookmarkCount: 12,
    isQuickAccess: false,
    createdAt: "2023-11-01T16:45:00Z",
    color: "bg-amber-500",
    previewLinks: [
      {
        title: "Notion - All-in-one workspace",
        url: "https://notion.so",
        domain: "notion.so",
        favicon: "/placeholder.svg?height=16&width=16",
      },
      {
        title: "Todoist - To-do list app",
        url: "https://todoist.com",
        domain: "todoist.com",
        favicon: "/placeholder.svg?height=16&width=16",
      },
      {
        title: "Trello - Project management",
        url: "https://trello.com",
        domain: "trello.com",
        favicon: "/placeholder.svg?height=16&width=16",
      },
    ],
  },
  {
    id: "5",
    title: "Learning",
    description: "Educational resources and courses",
    bookmarkCount: 23,
    isQuickAccess: false,
    createdAt: "2023-11-05T11:30:00Z",
    color: "bg-red-500",
    previewLinks: [
      {
        title: "Coursera - Online Courses",
        url: "https://coursera.org",
        domain: "coursera.org",
        favicon: "/placeholder.svg?height=16&width=16",
      },
      {
        title: "edX - Free Online Courses",
        url: "https://edx.org",
        domain: "edx.org",
        favicon: "/placeholder.svg?height=16&width=16",
      },
      {
        title: "Khan Academy - Free Education",
        url: "https://khanacademy.org",
        domain: "khanacademy.org",
        favicon: "/placeholder.svg?height=16&width=16",
      },
    ],
  },
  {
    id: "6",
    title: "Inspiration",
    description: "Creative inspiration and ideas",
    bookmarkCount: 18,
    isQuickAccess: false,
    createdAt: "2023-11-10T13:20:00Z",
    color: "bg-indigo-500",
    previewLinks: [
      {
        title: "Awwwards - Website Awards",
        url: "https://awwwards.com",
        domain: "awwwards.com",
        favicon: "/placeholder.svg?height=16&width=16",
      },
      {
        title: "Pinterest - Ideas and Inspiration",
        url: "https://pinterest.com",
        domain: "pinterest.com",
        favicon: "/placeholder.svg?height=16&width=16",
      },
      {
        title: "Muzli - Design Inspiration",
        url: "https://muz.li",
        domain: "muz.li",
        favicon: "/placeholder.svg?height=16&width=16",
      },
    ],
  },
]

export default function CollectionsPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <main className="flex-1 p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Collections</h1>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <PlusIcon className="h-4 w-4 mr-2" />
                New Collection
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create Collection</DialogTitle>
                <DialogDescription>Create a new collection to organize your bookmarks.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Collection name" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" placeholder="Collection description" />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="quick-access" />
                  <Label htmlFor="quick-access">Add to Quick Access</Label>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Create Collection</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="relative max-w-md mb-6">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search collections..." className="pl-9" />
        </div>

        {/* Collections grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((collection) => (
            <Card
              key={collection.id}
              className="group overflow-hidden transition-all hover:shadow-md border-transparent hover:border-primary"
            >
              <Link href={`/app/bookmark/collections/${collection.title.toLowerCase()}`} className="block">
                <CardHeader className={`p-4 ${collection.color} bg-opacity-10 border-b relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        {collection.title}
                        {collection.isQuickAccess && <StarIcon className="h-4 w-4 fill-yellow-400 text-yellow-400" />}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">{collection.description}</p>
                    </div>
                    <Badge variant="secondary" className="rounded-full px-2.5">
                      {collection.bookmarkCount}
                    </Badge>
                  </div>
                </CardHeader>
              </Link>

              <CardContent className="p-0">
                <div className="divide-y">
                  {collection.previewLinks.map((link, index) => (
                    <Link
                      key={index}
                      href={link.url}
                      target="_blank"
                      className="flex items-center gap-3 p-3 hover:bg-accent transition-colors group/link"
                    >
                      <div className="w-8 h-8 rounded-md overflow-hidden flex-shrink-0 bg-muted flex items-center justify-center">
                        <img
                          src={link.favicon || "/placeholder.svg"}
                          alt=""
                          className="w-5 h-5"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/placeholder.svg?height=16&width=16";
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium line-clamp-1 group-hover/link:text-primary transition-colors">
                          {link.title}
                        </div>
                        <p className="text-xs text-muted-foreground">{link.domain}</p>
                      </div>
                      <ExternalLinkIcon className="h-4 w-4 text-muted-foreground opacity-0 group-hover/link:opacity-100 transition-opacity" />
                    </Link>
                  ))}
                </div>
              </CardContent>

              <CardFooter className="p-4 flex justify-between items-center border-t bg-muted/20">
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontalIcon className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem>
                        <PencilIcon className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      {collection.isQuickAccess ? (
                        <DropdownMenuItem>
                          <StarIcon className="h-4 w-4 mr-2" />
                          Remove from Quick Access
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem>
                          <StarIcon className="h-4 w-4 mr-2" />
                          Add to Quick Access
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        <TrashIcon className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <span className="text-xs text-muted-foreground">
                    Created {new Date(collection.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                  asChild
                >
                  <Link href={`/app/bookmark/collections/${collection.title.toLowerCase()}`}>
                    View all
                    <ArrowRightIcon className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}