"use client"

import Link from "next/link"
import { format } from 'date-fns';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../components/ui/tab"
import {
  BookmarkIcon,
  FolderIcon,
  TagIcon,
  PlusIcon,
  SearchIcon,
  FilterIcon,
  ArrowUpDownIcon,
  ExternalLinkIcon,
  MoreHorizontalIcon,
  ListIcon,
  GridIcon,
  XIcon,
  HeartIcon,
  ClockIcon,
  TrendingUpIcon,
  PencilIcon,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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

// Sample bookmark data
const bookmarks = [
  {
    id: "1",
    title: "GitHub",
    description: "Where the world builds software",
    url: "https://github.com",
    favicon: "https://github.githubassets.com/favicons/favicon.svg",
    tags: ["development", "git", "code"],
    collection: "Development",
    dateAdded: "2023-12-15T10:30:00Z",
    isFavorite: true,
    visitCount: 42,
  },
  {
    id: "2",
    title: "MDN Web Docs",
    description: "Resources for developers, by developers",
    url: "https://developer.mozilla.org",
    favicon: "/placeholder.svg?height=16&width=16",
    tags: ["documentation", "web", "reference"],
    collection: "Development",
    dateAdded: "2023-12-10T14:20:00Z",
    isFavorite: false,
    visitCount: 28,
  },
  {
    id: "3",
    title: "Stack Overflow",
    description: "Where developers learn, share, & build careers",
    url: "https://stackoverflow.com",
    favicon: "/placeholder.svg?height=16&width=16",
    tags: ["qa", "community", "programming"],
    collection: "Development",
    dateAdded: "2023-12-05T09:15:00Z",
    isFavorite: true,
    visitCount: 35,
  },
  {
    id: "4",
    title: "Next.js Documentation",
    description: "The React Framework for the Web",
    url: "https://nextjs.org/docs",
    favicon: "/placeholder.svg?height=16&width=16",
    tags: ["nextjs", "react", "docs"],
    collection: "Development",
    dateAdded: "2023-12-01T16:45:00Z",
    isFavorite: false,
    visitCount: 29,
  },
  {
    id: "5",
    title: "Dribbble",
    description: "Discover the world's top designers & creatives",
    url: "https://dribbble.com",
    favicon: "/placeholder.svg?height=16&width=16",
    tags: ["inspiration", "ui", "design"],
    collection: "Design",
    dateAdded: "2023-11-28T11:30:00Z",
    isFavorite: false,
    visitCount: 18,
  },
  {
    id: "6",
    title: "Figma",
    description: "The collaborative interface design tool",
    url: "https://figma.com",
    favicon: "/placeholder.svg?height=16&width=16",
    tags: ["tool", "design", "collaboration"],
    collection: "Design",
    dateAdded: "2023-11-25T13:20:00Z",
    isFavorite: true,
    visitCount: 38,
  },
  {
    id: "7",
    title: "Behance",
    description: "Showcase and discover creative work",
    url: "https://behance.net",
    favicon: "/placeholder.svg?height=16&width=16",
    tags: ["portfolio", "showcase", "creative"],
    collection: "Design",
    dateAdded: "2023-11-20T15:10:00Z",
    isFavorite: false,
    visitCount: 15,
  },
  {
    id: "8",
    title: "The Future of Web Development",
    description: "Exploring upcoming trends in web development",
    url: "https://medium.com",
    favicon: "/placeholder.svg?height=16&width=16",
    tags: ["article", "web", "future"],
    collection: "Reading List",
    dateAdded: "2023-11-15T10:05:00Z",
    isFavorite: false,
    visitCount: 12,
  },
  {
    id: "9",
    title: "CSS Architecture Best Practices",
    description: "How to structure your CSS for maintainability",
    url: "https://css-tricks.com",
    favicon: "/placeholder.svg?height=16&width=16",
    tags: ["css", "architecture", "best-practices"],
    collection: "Reading List",
    dateAdded: "2023-11-10T09:30:00Z",
    isFavorite: false,
    visitCount: 10,
  },
  {
    id: "10",
    title: "JavaScript Performance Tips",
    description: "Optimize your JavaScript code for better performance",
    url: "https://dev.to",
    favicon: "/placeholder.svg?height=16&width=16",
    tags: ["javascript", "performance", "optimization"],
    collection: "Reading List",
    dateAdded: "2023-11-05T14:45:00Z",
    isFavorite: true,
    visitCount: 22,
  },
  {
    id: "11",
    title: "Vercel",
    description: "Develop. Preview. Ship.",
    url: "https://vercel.com",
    favicon: "/placeholder.svg?height=16&width=16",
    tags: ["hosting", "deployment", "platform"],
    collection: "Development",
    dateAdded: "2023-11-01T11:20:00Z",
    isFavorite: true,
    visitCount: 24,
  },
  {
    id: "12",
    title: "Tailwind CSS",
    description: "A utility-first CSS framework for rapid UI development",
    url: "https://tailwindcss.com",
    favicon: "/placeholder.svg?height=16&width=16",
    tags: ["css", "framework", "utility"],
    collection: "Development",
    dateAdded: "2023-10-28T16:15:00Z",
    isFavorite: false,
    visitCount: 31,
  },
]

// Sample collections and tags for filters
const collections = [
  { id: "1", name: "Development", color: "bg-blue-500" },
  { id: "2", name: "Design", color: "bg-purple-500" },
  { id: "3", name: "Reading List", color: "bg-green-500" },
  { id: "4", name: "Productivity", color: "bg-amber-500" },
  { id: "5", name: "Learning", color: "bg-red-500" },
]

const tags = [
  { id: "1", name: "development" },
  { id: "2", name: "design" },
  { id: "3", name: "react" },
  { id: "4", name: "nextjs" },
  { id: "5", name: "css" },
  { id: "6", name: "javascript" },
  { id: "7", name: "web" },
  { id: "8", name: "tool" },
  { id: "9", name: "article" },
  { id: "10", name: "documentation" },
]

// Bookmark Edit Form Component
function BookmarkEditForm({ bookmark }: { bookmark: (typeof bookmarks)[0] }) {
  return (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="edit-url">URL</Label>
        <Input id="edit-url" defaultValue={bookmark.url} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="edit-title">Title</Label>
        <Input id="edit-title" defaultValue={bookmark.title} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="edit-description">Description</Label>
        <Textarea id="edit-description" defaultValue={bookmark.description} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="edit-collection">Collection</Label>
        <Select defaultValue={bookmark.collection.toLowerCase()}>
          <SelectTrigger id="edit-collection">
            <SelectValue placeholder="Select a collection" />
          </SelectTrigger>
          <SelectContent>
            {collections.map((collection) => (
              <SelectItem key={collection.id} value={collection.name.toLowerCase()}>
                {collection.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="edit-tags">Tags</Label>
        <Input id="edit-tags" defaultValue={bookmark.tags.join(", ")} />
      </div>
      <div className="flex items-center space-x-2 pt-2">
        <Switch id="edit-favorite" defaultChecked={bookmark.isFavorite} />
        <Label htmlFor="edit-favorite">Mark as favorite</Label>
      </div>
    </div>
  )
}

// Bookmark Card Component
function BookmarkCard({ bookmark }: { bookmark: (typeof bookmarks)[0] }) {
  return (
    <div
      key={bookmark.id}
      className="group relative flex flex-col rounded-lg border p-4 hover:border-primary transition-colors h-full"
    >
      <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon" className="h-7 w-7">
          {bookmark.isFavorite ? (
            <HeartIcon className="h-4 w-4 fill-red-500 text-red-500" />
          ) : (
            <HeartIcon className="h-4 w-4" />
          )}
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
          <Link href={bookmark.url} target="_blank">
            <ExternalLinkIcon className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="flex items-start gap-3 mb-2">
        <div className="w-8 h-8 rounded-md overflow-hidden flex-shrink-0 bg-muted flex items-center justify-center">
          <img
            src={bookmark.favicon || "/placeholder.svg"}
            alt=""
            className="w-5 h-5"
            onError={(e) => {
              ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=16&width=16"
            }}
          />
        </div>
        <div className="flex-1 min-w-0 pr-8">
          <Link href={bookmark.url} target="_blank" className="font-medium hover:underline line-clamp-1 block">
            {bookmark.title}
          </Link>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{bookmark.description}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
        {bookmark.tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="text-xs">
            {tag}
          </Badge>
        ))}
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs font-normal">
            {bookmark.collection}
          </Badge>
          <span>{format(new Date(bookmark.dateAdded), 'MM/dd/yyyy')}</span>
        </div>
        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <MoreHorizontalIcon className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <Dialog>
                <DialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <PencilIcon className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[525px]">
                  <DialogHeader>
                    <DialogTitle>Edit Bookmark</DialogTitle>
                    <DialogDescription>Make changes to your bookmark.</DialogDescription>
                  </DialogHeader>
                  <BookmarkEditForm bookmark={bookmark} />
                  <DialogFooter>
                    <Button type="submit">Save changes</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <DropdownMenuItem>Add to Collection</DropdownMenuItem>
              <DropdownMenuItem>Add Tags</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}

export default function BookmarksPage() {
  // For demo purposes, let's assume we have active filters
  const activeFilters = {
    collections: ["Development"],
    tags: ["react", "nextjs"],
  }

  // Get all unique tags from bookmarks
  const allTags = Array.from(new Set(bookmarks.flatMap((bookmark) => bookmark.tags))).sort()

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      {/* <aside className="w-64 border-r p-6 flex flex-col gap-6">
        <div className="flex items-center gap-2 font-semibold text-xl">
          <BookmarkIcon className="h-6 w-6" />
          <span>Bookmarks</span>
        </div>

        <nav className="space-y-1">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <LayoutDashboardIcon className="h-5 w-5" />
            <span>Dashboard</span>
          </Link>
          <Link
            href="/bookmarks"
            className="flex items-center gap-3 px-3 py-2 rounded-md bg-accent text-accent-foreground"
          >
            <BookmarkIcon className="h-5 w-5" />
            <span>All Bookmarks</span>
          </Link>
          <Link
            href="/collections"
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <FolderIcon className="h-5 w-5" />
            <span>Collections</span>
          </Link>
          <Link
            href="/tags"
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <TagIcon className="h-5 w-5" />
            <span>Tags</span>
          </Link>
        </nav>

        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium">Quick Access</h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <PlusIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 Goodman">
                <DropdownMenuLabel>Add to Quick Access</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {collections.map((collection) => (
                  <DropdownMenuCheckboxItem
                    key={collection.id}
                    checked={["Development", "Design", "Reading List"].includes(collection.name)}
                  >
                    {collection.name}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="space-y-2">
            <Link
              href="/collections/development"
              className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors group"
            >
              <div className="w-6 h-6 rounded bg-blue-500 bg-opacity-20 flex items-center justify-center flex-shrink-0">
                <BookmarkIcon className="h-3.5 w-3.5 text-blue-500" />
              </div>
              <span className="flex-1 truncate">Development</span>
              <HeartIcon className="h-3.5 w-3.5 text-red-500 fill-red-500" />
            </Link>
            <Link
              href="/collections/design"
              className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors group"
            >
              <div className="w-6 h-6 rounded bg-purple-500 bg-opacity-20 flex items-center justify-center flex-shrink-0">
                <BookmarkIcon className="h-3.5 w-3.5 text-purple-500" />
              </div>
              <span className="flex-1 truncate">Design Resources</span>
              <HeartIcon className="h-3.5 w-3.5 text-red-500 fill-red-500" />
            </Link>
            <Link
              href="/collections/reading"
              className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors group"
            >
              <div className="w-6 h-6 rounded bg-green-500 bg-opacity-20 flex items-center justify-center flex-shrink-0">
                <BookmarkIcon className="h-3.5 w-3.5 text-green-500" />
              </div>
              <span className="flex-1 truncate">Reading List</span>
              <HeartIcon className="h-3.5 w-3.5 text-red-500 fill-red-500" />
            </Link>
          </div>
        </div>
      </aside> */}

      {/* Main content */}
      <main className="flex-1 p-6">
        {/* Header */}
        <div className="rounded-lg p-6 mb-6 bg-primary/5 border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                <BookmarkIcon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">All Bookmarks</h1>
                <p className="text-muted-foreground mt-1">Browse and manage all your saved bookmarks</p>
              </div>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Bookmark
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                  <DialogTitle>Add Bookmark</DialogTitle>
                  <DialogDescription>Add a new bookmark to your collection.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="url">URL</Label>
                    <Input id="url" placeholder="https://example.com" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" placeholder="Bookmark title" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" placeholder="Bookmark description" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="collection">Collection</Label>
                    <Select>
                      <SelectTrigger id="collection">
                        <SelectValue placeholder="Select a collection" />
                      </SelectTrigger>
                      <SelectContent>
                        {collections.map((collection) => (
                          <SelectItem key={collection.id} value={collection.name.toLowerCase()}>
                            {collection.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="tags">Tags</Label>
                    <Input id="tags" placeholder="Enter tags separated by commas" />
                  </div>
                  <div className="flex items-center space-x-2 pt-2">
                    <Switch id="favorite" />
                    <Label htmlFor="favorite">Mark as favorite</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Add Bookmark</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Search and filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search bookmarks..." className="pl-9" />
          </div>

          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <FilterIcon className="h-4 w-4" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Filter by Collection</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {collections.map((collection) => (
                  <DropdownMenuCheckboxItem
                    key={collection.id}
                    checked={activeFilters.collections.includes(collection.name)}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${collection.color}`}></div>
                      {collection.name}
                    </div>
                  </DropdownMenuCheckboxItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Filter by Tag</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {tags.slice(0, 5).map((tag) => (
                  <DropdownMenuCheckboxItem key={tag.id} checked={activeFilters.tags.includes(tag.name)}>
                    {tag.name}
                  </DropdownMenuCheckboxItem>
                ))}
                <DropdownMenuItem>
                  <Link href="/tags" className="w-full">
                    View all tags...
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Select defaultValue="date-desc">
              <SelectTrigger className="w-[180px] gap-2">
                <ArrowUpDownIcon className="h-4 w-4" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Newest First</SelectItem>
                <SelectItem value="date-asc">Oldest First</SelectItem>
                <SelectItem value="title-asc">Title (A-Z)</SelectItem>
                <SelectItem value="title-desc">Title (Z-A)</SelectItem>
                <SelectItem value="visits-desc">Most Visited</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex border rounded-md">
              <Button variant="ghost" size="icon" className="rounded-r-none border-r" asChild>
                <Link href="/app/bookmark/bookmarks/list">
                  <ListIcon className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" className="rounded-l-none bg-accent text-accent-foreground">
                <GridIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Active filters */}
        {(activeFilters.collections.length > 0 || activeFilters.tags.length > 0) && (
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="text-sm text-muted-foreground mr-2 py-1">Active filters:</div>
            {activeFilters.collections.map((collection) => (
              <Badge key={collection} variant="secondary" className="flex items-center gap-1">
                <FolderIcon className="h-3 w-3" />
                {collection}
                <Button variant="ghost" size="icon" className="h-4 w-4 ml-1 p-0">
                  <XIcon className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
            {activeFilters.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                <TagIcon className="h-3 w-3" />
                {tag}
                <Button variant="ghost" size="icon" className="h-4 w-4 ml-1 p-0">
                  <XIcon className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
            <Button variant="ghost" size="sm" className="text-xs h-6">
              Clear all
            </Button>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="all" className="mb-6">
          <TabsList>
            <TabsTrigger value="all" className="flex items-center gap-1">
              <BookmarkIcon className="h-4 w-4" />
              All
            </TabsTrigger>
            <TabsTrigger value="favorites" className="flex items-center gap-1">
              <HeartIcon className="h-4 w-4" />
              Favorites
            </TabsTrigger>
            <TabsTrigger value="recent" className="flex items-center gap-1">
              <ClockIcon className="h-4 w-4" />
              Recent
            </TabsTrigger>
            <TabsTrigger value="popular" className="flex items-center gap-1">
              <TrendingUpIcon className="h-4 w-4" />
              Most Visited
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">All Bookmarks</CardTitle>
                <CardDescription>Browse all your saved bookmarks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {bookmarks.map((bookmark) => (
                    <BookmarkCard key={bookmark.id} bookmark={bookmark} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="favorites" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Favorite Bookmarks</CardTitle>
                <CardDescription>Bookmarks you&apos;ve marked as favorites</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {bookmarks
                    .filter((bookmark) => bookmark.isFavorite)
                    .map((bookmark) => (
                      <BookmarkCard key={bookmark.id} bookmark={bookmark} />
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recent" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Recent Bookmarks</CardTitle>
                <CardDescription>Recently added bookmarks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {bookmarks
                    .sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime())
                    .slice(0, 6)
                    .map((bookmark) => (
                      <BookmarkCard key={bookmark.id} bookmark={bookmark} />
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="popular" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Most Visited Bookmarks</CardTitle>
                <CardDescription>Your most frequently visited bookmarks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {bookmarks
                    .sort((a, b) => b.visitCount - a.visitCount)
                    .slice(0, 6)
                    .map((bookmark) => (
                      <BookmarkCard key={bookmark.id} bookmark={bookmark} />
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Popular Tags */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Popular Tags</h3>
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <Badge key={tag} variant="outline" className="px-3 py-1 hover:bg-accent cursor-pointer">
                  {tag} ({bookmarks.filter((b) => b.tags.includes(tag)).length})
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-8">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium">1</span> to <span className="font-medium">12</span> of{" "}
            <span className="font-medium">247</span> bookmarks
          </p>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" className="bg-accent text-accent-foreground">
              1
            </Button>
            <Button variant="outline" size="sm">
              2
            </Button>
            <Button variant="outline" size="sm">
              3
            </Button>
            <Button variant="outline" size="sm">
              ...
            </Button>
            <Button variant="outline" size="sm">
              21
            </Button>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}