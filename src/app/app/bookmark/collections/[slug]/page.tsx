"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import {
  ChevronLeftIcon,
  PlusIcon,
  SearchIcon,
  ArrowUpDownIcon,
  BookmarkIcon,
  FolderIcon,
  TagIcon,
  XIcon,
  StarIcon,
  ExternalLinkIcon,
  MoreHorizontalIcon,
  HeartIcon,
  ClockIcon,
  ArrowRightIcon,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../../components/ui/tab"
import React from "react" // Import React for use()

interface CollectionPageProps {
  params: Promise<{ slug: string }> // Update type to reflect params as a Promise
}

export default function CollectionPage({ params }: CollectionPageProps) {
  // Unwrap the params Promise using React.use()
  const { slug } = React.use(params);

  // This would normally come from a database
  const collections = {
    development: {
      title: "Development",
      description: "Programming resources and tools",
      color: "bg-blue-500",
      isQuickAccess: true,
      bookmarks: [
        {
          title: "GitHub",
          description: "Where the world builds software",
          url: "https://github.com",
          domain: "github.com",
          favicon: "https://github.githubassets.com/favicons/favicon.svg",
          tags: ["git", "code", "repository"],
          dateAdded: "2023-12-15T10:30:00Z",
          isFavorite: true,
        },
        {
          title: "MDN Web Docs",
          description: "Resources for developers, by developers",
          url: "https://developer.mozilla.org",
          domain: "developer.mozilla.org",
          favicon: "/placeholder.svg?height=16&width=16",
          tags: ["documentation", "web", "reference"],
          dateAdded: "2023-12-10T14:20:00Z",
          isFavorite: false,
        },
        {
          title: "Stack Overflow",
          description: "Where developers learn, share, & build careers",
          url: "https://stackoverflow.com",
          domain: "stackoverflow.com",
          favicon: "/placeholder.svg?height=16&width=16",
          tags: ["qa", "community", "programming"],
          dateAdded: "2023-12-05T09:15:00Z",
          isFavorite: true,
        },
        {
          title: "Next.js Documentation",
          description: "The React Framework for the Web",
          url: "https://nextjs.org/docs",
          domain: "nextjs.org",
          favicon: "/placeholder.svg?height=16&width=16",
          tags: ["nextjs", "react", "docs"],
          dateAdded: "2023-12-01T16:45:00Z",
          isFavorite: false,
        },
        {
          title: "Vercel",
          description: "Develop. Preview. Ship.",
          url: "https://vercel.com",
          domain: "vercel.com",
          favicon: "/placeholder.svg?height=16&width=16",
          tags: ["hosting", "deployment", "platform"],
          dateAdded: "2023-11-25T13:20:00Z",
          isFavorite: true,
        },
        {
          title: "Tailwind CSS",
          description: "A utility-first CSS framework for rapid UI development",
          url: "https://tailwindcss.com",
          domain: "tailwindcss.com",
          favicon: "/placeholder.svg?height=16&width=16",
          tags: ["css", "framework", "utility"],
          dateAdded: "2023-11-20T15:10:00Z",
          isFavorite: false,
        },
      ],
    },
    design: {
      title: "Design",
      description: "UI/UX resources and inspiration",
      color: "bg-purple-500",
      isQuickAccess: true,
      bookmarks: [
        {
          title: "Dribbble",
          description: "Discover the world's top designers & creatives",
          url: "https://dribbble.com",
          domain: "dribbble.com",
          favicon: "/placeholder.svg?height=16&width=16",
          tags: ["inspiration", "ui", "design"],
          dateAdded: "2023-11-28T11:30:00Z",
          isFavorite: true,
        },
        {
          title: "Figma",
          description: "The collaborative interface design tool",
          url: "https://figma.com",
          domain: "figma.com",
          favicon: "/placeholder.svg?height=16&width=16",
          tags: ["tool", "design", "collaboration"],
          dateAdded: "2023-11-25T13:20:00Z",
          isFavorite: true,
        },
        {
          title: "Behance",
          description: "Showcase and discover creative work",
          url: "https://behance.net",
          domain: "behance.net",
          favicon: "/placeholder.svg?height=16&width=16",
          tags: ["portfolio", "showcase", "creative"],
          dateAdded: "2023-11-20T15:10:00Z",
          isFavorite: false,
        },
        {
          title: "Coolors",
          description: "The super fast color schemes generator",
          url: "https://coolors.co",
          domain: "coolors.co",
          favicon: "/placeholder.svg?height=16&width=16",
          tags: ["colors", "palette", "generator"],
          dateAdded: "2023-11-15T10:05:00Z",
          isFavorite: false,
        },
        {
          title: "Unsplash",
          description: "Beautiful, free images and photos",
          url: "https://unsplash.com",
          domain: "unsplash.com",
          favicon: "/placeholder.svg?height=16&width=16",
          tags: ["images", "photos", "free"],
          dateAdded: "2023-11-10T09:30:00Z",
          isFavorite: true,
        },
      ],
    },
    reading: {
      title: "Reading-List",
      description: "Articles to read later",
      color: "bg-green-500",
      isQuickAccess: true,
      bookmarks: [
        {
          title: "The Future of Web Development",
          description: "Exploring upcoming trends in web development",
          url: "https://medium.com",
          domain: "medium.com",
          favicon: "/placeholder.svg?height=16&width=16",
          tags: ["article", "web", "future"],
          dateAdded: "2023-11-15T10:05:00Z",
          isFavorite: false,
        },
        {
          title: "CSS Architecture Best Practices",
          description: "How to structure your CSS for maintainability",
          url: "https://css-tricks.com",
          domain: "css-tricks.com",
          favicon: "/placeholder.svg?height=16&width=16",
          tags: ["css", "architecture", "best-practices"],
          dateAdded: "2023-11-10T09:30:00Z",
          isFavorite: false,
        },
        {
          title: "JavaScript Performance Tips",
          description: "Optimize your JavaScript code for better performance",
          url: "https://dev.to",
          domain: "dev.to",
          favicon: "/placeholder.svg?height=16&width=16",
          tags: ["javascript", "performance", "optimization"],
          dateAdded: "2023-11-05T14:45:00Z",
          isFavorite: true,
        },
        {
          title: "The State of JavaScript 2023",
          description: "Annual survey of JavaScript ecosystem",
          url: "https://stateofjs.com",
          domain: "stateofjs.com",
          favicon: "/placeholder.svg?height=16&width=16",
          tags: ["javascript", "survey", "trends"],
          dateAdded: "2023-10-30T11:20:00Z",
          isFavorite: false,
        },
        {
          title: "Designing for Accessibility",
          description: "How to make your websites accessible to everyone",
          url: "https://a11yproject.com",
          domain: "a11yproject.com",
          favicon: "/placeholder.svg?height=16&width=16",
          tags: ["accessibility", "design", "inclusive"],
          dateAdded: "2023-10-25T16:15:00Z",
          isFavorite: true,
        },
      ],
    },
  }

  const collection = collections[slug as keyof typeof collections]

  if (!collection) {
    return <div>Collection not found</div>
  }

  // Extract all unique tags from the collection's bookmarks
  const allTags = Array.from(new Set(collection.bookmarks.flatMap((bookmark) => bookmark.tags))).sort()

  // For demo purposes, let's assume we have active tag filters
  const activeTagFilters = ["react", "nextjs"]

  return (
    <div className="flex min-h-screen bg-background">
      <main className="flex-1 p-6">
        {/* Collection Header */}
        <div
          className={`rounded-lg p-6 mb-6 ${collection.color} bg-opacity-10 border border-${collection.color.replace("bg-", "")}/20`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-lg ${collection.color} bg-opacity-20 flex items-center justify-center`}
              >
                <FolderIcon className={`h-6 w-6 text-${collection.color.replace("bg-", "")}`} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">{collection.title}</h1>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-8 px-3 gap-1.5 ${collection.isQuickAccess ? "bg-yellow-100/50 text-yellow-700 hover:bg-yellow-200/50 hover:text-yellow-800" : "hover:bg-yellow-100/50 hover:text-yellow-700"}`}
                  >
                    <StarIcon
                      className={`h-4 w-4 ${collection.isQuickAccess ? "fill-yellow-400 text-yellow-400" : ""}`}
                    />
                    {collection.isQuickAccess ? "In Quick Access" : "Add to Quick Access"}
                  </Button>
                </div>
                <p className="text-muted-foreground mt-1">{collection.description}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/app/bookmark/collections">
                  <ChevronLeftIcon className="h-4 w-4 mr-1" />
                  Back
                </Link>
              </Button>
              <Button>
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Bookmark
              </Button>
            </div>
          </div>
        </div>

        {/* Search and filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder={`Search in ${collection.title}...`} className="pl-9" />
          </div>

          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <TagIcon className="h-4 w-4" />
                  Tags
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Filter by Tag</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {allTags.map((tag) => (
                  <DropdownMenuCheckboxItem key={tag} checked={activeTagFilters.includes(tag)}>
                    {tag}
                  </DropdownMenuCheckboxItem>
                ))}
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
          </div>
        </div>

        {/* Active tag filters */}
        {activeTagFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="text-sm text-muted-foreground mr-2 py-1">Active tag filters:</div>
            {activeTagFilters.map((tag) => (
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
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">All Bookmarks</CardTitle>
                <CardDescription>All bookmarks in this collection</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {collection.bookmarks.map((bookmark, index) => (
                    <div
                      key={index}
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
                              const target = e.target as HTMLImageElement;
                              target.src = "/placeholder.svg?height=16&width=16";
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0 pr-8">
                          <Link
                            href={bookmark.url}
                            target="_blank"
                            className="font-medium hover:underline line-clamp-1 block"
                          >
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
                        <div className="flex items-center gap-1">
                          <ClockIcon className="h-3 w-3" />
                          <span>{new Date(bookmark.dateAdded).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6">
                                <MoreHorizontalIcon className="h-3.5 w-3.5" />
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
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/bookmarks" className="flex items-center gap-1">
                    View all bookmarks
                    <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
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
                  {collection.bookmarks
                    .filter((bookmark) => bookmark.isFavorite)
                    .map((bookmark, index) => (
                      <div
                        key={index}
                        className="group relative flex flex-col rounded-lg border p-4 hover:border-primary transition-colors h-full"
                      >
                        <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <HeartIcon className="h-4 w-4 fill-red-500 text-red-500" />
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
                                const target = e.target as HTMLImageElement;
                                target.src = "/placeholder.svg?height=16&width=16";
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0 pr-8">
                            <Link
                              href={bookmark.url}
                              target="_blank"
                              className="font-medium hover:underline line-clamp-1 block"
                            >
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
                          <div className="flex items-center gap-1">
                            <ClockIcon className="h-3 w-3" />
                            <span>{new Date(bookmark.dateAdded).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                  <MoreHorizontalIcon className="h-3.5 w-3.5" />
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
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/bookmarks?favorites=true" className="flex items-center gap-1">
                    View all favorites
                    <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="recent" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Recent Bookmarks</CardTitle>
                <CardDescription>Recently added bookmarks in this collection</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {collection.bookmarks
                    .sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime())
                    .slice(0, 3)
                    .map((bookmark, index) => (
                      <div
                        key={index}
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
                                const target = e.target as HTMLImageElement;
                                target.src = "/placeholder.svg?height=16&width=16";
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0 pr-8">
                            <Link
                              href={bookmark.url}
                              target="_blank"
                              className="font-medium hover:underline line-clamp-1 block"
                            >
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
                          <div className="flex items-center gap-1">
                            <ClockIcon className="h-3 w-3" />
                            <span>{new Date(bookmark.dateAdded).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                  <MoreHorizontalIcon className="h-3.5 w-3.5" />
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
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/bookmarks?recent=true" className="flex items-center gap-1">
                    View all recent bookmarks
                    <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}