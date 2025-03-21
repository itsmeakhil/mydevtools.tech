"use client"

import Link from "next/link"
import { format } from 'date-fns' // Add this import
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  PlusIcon,
  SearchIcon,
  FilterIcon,
  ArrowUpDownIcon,
  ExternalLinkIcon,
  MoreHorizontalIcon,
  ListIcon,
  GridIcon,
  StarIcon,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

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
    favorite: true,
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
    favorite: false,
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
    favorite: true,
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
    favorite: false,
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
    favorite: false,
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
    favorite: true,
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
    favorite: false,
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
    favorite: false,
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
    favorite: false,
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
    favorite: true,
  },
]

export default function BookmarksListPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <h1 className="text-3xl font-bold absolute">DEBUG: Bookmarks List Page</h1> {/* Debug message */}
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
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">Quick Access</h3>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <PlusIcon className="h-4 w-4" />
            </Button>
          </div>
          <nav className="space-y-1">
            <Link
              href="/collections/development"
              className="block px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              Development
            </Link>
            <Link
              href="/collections/design"
              className="block px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              Design Resources
            </Link>
            <Link
              href="/collections/reading"
              className="block px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              Reading List
            </Link>
          </nav>
        </div>
      </aside> */}

      {/* Main content */}
      <main className="flex-1 p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">All Bookmarks</h1>
          <Button>
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Bookmark
          </Button>
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
                <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <span>Collection</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span>Tags</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span>Date Added</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span>Favorites</span>
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
              </SelectContent>
            </Select>

            <div className="flex border rounded-md">
              <Button variant="ghost" size="icon" className="rounded-r-none bg-accent text-accent-foreground">
                <ListIcon className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-l-none border-l" asChild>
                <Link href="/bookmarks">
                  <GridIcon className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Bookmarks table */}
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Title</TableHead>
                <TableHead className="hidden md:table-cell">Collection</TableHead>
                <TableHead className="hidden lg:table-cell">Tags</TableHead>
                <TableHead className="hidden md:table-cell">Date Added</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookmarks.map((bookmark) => (
                <TableRow key={bookmark.id}>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <StarIcon className={`h-4 w-4 ${bookmark.favorite ? "fill-yellow-400 text-yellow-400" : ""}`} />
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-md overflow-hidden flex-shrink-0 bg-muted flex items-center justify-center">
                        <img
                          src={bookmark.favicon || "/placeholder.svg"}
                          alt=""
                          className="w-4 h-4"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/placeholder.svg?height=16&width=16"
                          }}
                        />
                      </div>
                      <div>
                        <div className="font-medium">{bookmark.title}</div>
                        <div className="text-xs text-muted-foreground truncate max-w-[300px]">{bookmark.url}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant="outline">{bookmark.collection}</Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {bookmark.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {bookmark.tags.length > 2 && (
                        <span className="text-xs text-muted-foreground">+{bookmark.tags.length - 2} more</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(bookmark.dateAdded), 'MM/dd/yyyy')} {/* Use date-fns format */}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                        <Link href={bookmark.url} target="_blank">
                          <ExternalLinkIcon className="h-4 w-4" />
                        </Link>
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontalIcon className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem>Add to Collection</DropdownMenuItem>
                          <DropdownMenuItem>Add Tags</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-8">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium">1</span> to <span className="font-medium">10</span> of{" "}
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
              25
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