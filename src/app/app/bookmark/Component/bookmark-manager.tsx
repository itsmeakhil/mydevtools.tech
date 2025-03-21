"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../components/ui/tab"
import { Badge } from "@/components/ui/badge"
import {
  BookmarkIcon,
  FolderIcon,
  TagIcon,
  PlusIcon,
  ExternalLinkIcon,
  ClockIcon,
  StarIcon,
  TrendingUpIcon,
  HeartIcon,
  EyeIcon,
  ArrowRightIcon,
  CheckIcon,
} from "lucide-react"
import { ArrowDownIcon, UploadIcon } from "lucide-react"
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
import { Switch } from "@/components/ui/switch"

export default function DashboardPage() {
  // Sample frequently used bookmarks data
  const frequentBookmarks = [
    {
      id: "1",
      title: "GitHub",
      description: "Where the world builds software",
      url: "https://github.com",
      favicon: "https://github.githubassets.com/favicons/favicon.svg",
      visitCount: 42,
      lastVisited: "2 hours ago",
      tags: ["development", "git"],
    },
    {
      id: "2",
      title: "Figma",
      description: "The collaborative interface design tool",
      url: "https://figma.com",
      favicon: "/placeholder.svg?height=16&width=16",
      visitCount: 38,
      lastVisited: "4 hours ago",
      tags: ["design", "tool"],
    },
    {
      id: "3",
      title: "Stack Overflow",
      description: "Where developers learn, share, & build careers",
      url: "https://stackoverflow.com",
      favicon: "/placeholder.svg?height=16&width=16",
      visitCount: 35,
      lastVisited: "1 day ago",
      tags: ["development", "qa"],
    },
    {
      id: "4",
      title: "Next.js Documentation",
      description: "The React Framework for the Web",
      url: "https://nextjs.org/docs",
      favicon: "/placeholder.svg?height=16&width=16",
      visitCount: 29,
      lastVisited: "2 days ago",
      tags: ["development", "react"],
    },
    {
      id: "5",
      title: "Vercel",
      description: "Develop. Preview. Ship.",
      url: "https://vercel.com",
      favicon: "/placeholder.svg?height=16&width=16",
      visitCount: 24,
      lastVisited: "3 days ago",
      tags: ["development", "hosting"],
    },
  ]

  // Sample recent bookmarks
  const recentBookmarks = [
    {
      id: "1",
      title: "Next.js Documentation",
      description: "The React Framework for the Web",
      url: "https://nextjs.org/docs",
      favicon: "/placeholder.svg?height=16&width=16",
      dateAdded: "2 hours ago",
      tags: ["nextjs", "react", "docs"],
    },
    {
      id: "2",
      title: "Tailwind CSS",
      description: "A utility-first CSS framework for rapid UI development",
      url: "https://tailwindcss.com",
      favicon: "/placeholder.svg?height=16&width=16",
      dateAdded: "5 hours ago",
      tags: ["css", "framework", "utility"],
    },
    {
      id: "3",
      title: "React Query",
      description: "Hooks for fetching, caching and updating asynchronous data in React",
      url: "https://tanstack.com/query",
      favicon: "/placeholder.svg?height=16&width=16",
      dateAdded: "1 day ago",
      tags: ["react", "data", "hooks"],
    },
  ]

  // Sample favorite bookmarks
  const favoriteBookmarks = [
    {
      id: "1",
      title: "GitHub",
      description: "Where the world builds software",
      url: "https://github.com",
      favicon: "https://github.githubassets.com/favicons/favicon.svg",
      dateAdded: "2 weeks ago",
      tags: ["development", "git"],
    },
    {
      id: "2",
      title: "Figma",
      description: "The collaborative interface design tool",
      url: "https://figma.com",
      favicon: "/placeholder.svg?height=16&width=16",
      dateAdded: "1 month ago",
      tags: ["design", "tool"],
    },
    {
      id: "3",
      title: "VS Code",
      description: "Code editing. Redefined.",
      url: "https://code.visualstudio.com",
      favicon: "/placeholder.svg?height=16&width=16",
      dateAdded: "3 months ago",
      tags: ["editor", "development", "tool"],
    },
  ]

  // Sample popular bookmarks
  const popularBookmarks = [
    {
      id: "1",
      title: "Stack Overflow",
      description: "Where developers learn, share, & build careers",
      url: "https://stackoverflow.com",
      favicon: "/placeholder.svg?height=16&width=16",
      visitCount: 87,
      tags: ["development", "qa"],
    },
    {
      id: "2",
      title: "MDN Web Docs",
      description: "Resources for developers, by developers",
      url: "https://developer.mozilla.org",
      favicon: "/placeholder.svg?height=16&width=16",
      visitCount: 65,
      tags: ["documentation", "web", "reference"],
    },
    {
      id: "3",
      title: "CSS-Tricks",
      description: "Tips, Tricks, and Techniques on using CSS",
      url: "https://css-tricks.com",
      favicon: "/placeholder.svg?height=16&width=16",
      visitCount: 52,
      tags: ["css", "web", "tutorials"],
    },
  ]

  // Sample collections data with enhanced information
  const collections = [
    {
      id: "1",
      title: "Development",
      description: "Programming resources and tools",
      count: 42,
      icon: "code",
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
      count: 28,
      icon: "palette",
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
      count: 15,
      icon: "book",
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
  ]

  return (
    <div className="flex min-h-screen bg-background">
      <main className="flex-1 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="w-full max-w-md">
            <Input placeholder="Search bookmarks..." className="w-full" />
          </div>
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <ArrowDownIcon className="h-4 w-4 mr-2" />
                  Import Bookmarks
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                  <DialogTitle>Import Bookmarks</DialogTitle>
                  <DialogDescription>Import bookmarks from your browser or an HTML file.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                  <div className="grid gap-2">
                    <h3 className="text-sm font-medium">Import from browser</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" className="justify-start">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="mr-2 h-4 w-4 text-blue-600"
                        >
                          <circle cx="12" cy="12" r="10"></circle>
                          <circle cx="12" cy="12" r="4"></circle>
                          <line x1="21.17" y1="8" x2="12" y2="8"></line>
                          <line x1="3.95" y1="6.06" x2="8.54" y2="14"></line>
                          <line x1="10.88" y1="21.94" x2="15.46" y2="14"></line>
                        </svg>
                        Chrome
                      </Button>
                      <Button variant="outline" className="justify-start">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="mr-2 h-4 w-4 text-blue-500"
                        >
                          <circle cx="12" cy="12" r="10"></circle>
                          <circle cx="12" cy="12" r="2"></circle>
                          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
                        </svg>
                        Safari
                      </Button>
                      <Button variant="outline" className="justify-start">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="mr-2 h-4 w-4 text-orange-500"
                        >
                          <circle cx="12" cy="12" r="10"></circle>
                          <circle cx="12" cy="12" r="4"></circle>
                        </svg>
                        Firefox
                      </Button>
                      <Button variant="outline" className="justify-start">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="mr-2 h-4 w-4 text-green-600"
                        >
                          <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0"></path>
                          <path d="M3.6 9h16.8M3.6 15h16.8"></path>
                        </svg>
                        Edge
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <h3 className="text-sm font-medium">Import from file</h3>
                    <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center">
                      <UploadIcon className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground mb-2">Drag and drop your bookmarks HTML file here</p>
                      <p className="text-xs text-muted-foreground mb-4">or</p>
                      <Button size="sm">Browse files</Button>
                      <p className="text-xs text-muted-foreground mt-4">
                        Supports exported bookmarks from Chrome, Firefox, Safari, and Edge
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <h3 className="text-sm font-medium">Import settings</h3>
                    <div className="flex items-center space-x-2">
                      <Switch id="create-collections" defaultChecked />
                      <Label htmlFor="create-collections">Create collections based on folders</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="preserve-dates" defaultChecked />
                      <Label htmlFor="preserve-dates">Preserve original dates</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="skip-duplicates" defaultChecked />
                      <Label htmlFor="skip-duplicates">Skip duplicate bookmarks</Label>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Import Bookmarks</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Bookmark
            </Button>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Total Bookmarks</h3>
                  <p className="text-3xl font-bold mt-1">247</p>
                  <p className="text-xs text-green-600 mt-1">+12 from last week</p>
                </div>
                <BookmarkIcon className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Collections</h3>
                  <p className="text-3xl font-bold mt-1">15</p>
                  <p className="text-xs text-muted-foreground mt-1">3 active collections</p>
                </div>
                <FolderIcon className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Tags</h3>
                  <p className="text-3xl font-bold mt-1">32</p>
                  <p className="text-xs text-muted-foreground mt-1">Most used: development</p>
                </div>
                <TagIcon className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Recent Activity</h3>
                  <p className="text-3xl font-bold mt-1">18</p>
                  <p className="text-xs text-muted-foreground mt-1">Added this week</p>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-muted-foreground"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Frequently Used Bookmarks */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <TrendingUpIcon className="h-5 w-5 text-primary" />
                  Frequently Used Bookmarks
                </CardTitle>
                <CardDescription>Your most visited bookmarks for quick access</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/app/bookmark/bookmarks">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {frequentBookmarks.map((bookmark) => (
              <div
                key={bookmark.id}
                className="group relative flex flex-col rounded-lg border p-4 hover:border-primary transition-colors"
              >
                <div className="absolute top-3 right-3 flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <StarIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                    asChild
                  >
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
                    <span>{bookmark.lastVisited}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUpIcon className="h-3 w-3" />
                    <span>{bookmark.visitCount} visits</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
          <CardFooter className="pt-0 pb-4 px-6">
            <Button variant="ghost" size="sm" className="ml-auto" asChild>
              <Link href="/app/bookmark/bookmarks">See all bookmarks</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="recent" className="mb-6">
          <TabsList>
            <TabsTrigger value="recent" className="flex items-center gap-1">
              <ClockIcon className="h-4 w-4" />
              Recent
            </TabsTrigger>
            <TabsTrigger value="favorites" className="flex items-center gap-1">
              <HeartIcon className="h-4 w-4" />
              Favorites
            </TabsTrigger>
            <TabsTrigger value="popular" className="flex items-center gap-1">
              <TrendingUpIcon className="h-4 w-4" />
              Popular
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recent" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Recently Added Bookmarks</CardTitle>
                <CardDescription>Bookmarks you&apos;ve added in the last few days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recentBookmarks.map((bookmark) => (
                    <div
                      key={bookmark.id}
                      className="group relative flex flex-col rounded-lg border p-4 hover:border-primary transition-colors h-full"
                    >
                      <div className="absolute top-3 right-3 flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <HeartIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                          asChild
                        >
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
                          <span>{bookmark.dateAdded}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/app/bookmark/bookmarks" className="flex items-center gap-1">
                    View all recent bookmarks
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
                  {favoriteBookmarks.map((bookmark) => (
                    <div
                      key={bookmark.id}
                      className="group relative flex flex-col rounded-lg border p-4 hover:border-primary transition-colors h-full"
                    >
                      <div className="absolute top-3 right-3 flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <CheckIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                          asChild
                        >
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
                          <div className="flex items-center gap-2">
                            <Link
                              href={bookmark.url}
                              target="_blank"
                              className="font-medium hover:underline line-clamp-1 block"
                            >
                              {bookmark.title}
                            </Link>
                            <HeartIcon className="h-3.5 w-3.5 text-red-500 fill-red-500 flex-shrink-0" />
                          </div>
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
                          <span>{bookmark.dateAdded}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/bookmarks?filter=favorites" className="flex items-center gap-1">
                    View all favorites
                    <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="popular" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Popular Bookmarks</CardTitle>
                <CardDescription>Your most visited bookmarks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {popularBookmarks.map((bookmark) => (
                    <div
                      key={bookmark.id}
                      className="group relative flex flex-col rounded-lg border p-4 hover:border-primary transition-colors h-full"
                    >
                      <div className="absolute top-3 right-3 flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <HeartIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                          asChild
                        >
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
                          <EyeIcon className="h-3 w-3 text-primary" />
                          <span>{bookmark.visitCount} visits</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/bookmarks?sort=popular" className="flex items-center gap-1">
                    View all popular bookmarks
                    <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Popular Tags */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4">Popular Tags</h3>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="px-3 py-1">
                development (45)
              </Badge>
              <Badge variant="outline" className="px-3 py-1">
                design (32)
              </Badge>
              <Badge variant="outline" className="px-3 py-1">
                resources (28)
              </Badge>
              <Badge variant="outline" className="px-3 py-1">
                tools (24)
              </Badge>
              <Badge variant="outline" className="px-3 py-1">
                tutorials (19)
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Collections with Preview Links - Enhanced UI */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <FolderIcon className="h-5 w-5 text-primary" />
                Collections
              </h2>
              <p className="text-sm text-muted-foreground">Your organized bookmark collections</p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/app/bookmark/collections" className="flex items-center gap-1">
                View all collections
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {collections.map((collection) => (
              <Card
                key={collection.id}
                className="group overflow-hidden transition-all hover:shadow-md border-transparent hover:border-primary"
              >
                <Link href={`/app/bookmark/collections/${collection.title.toLowerCase()}`} className="block">
                  <CardHeader className={`p-4 ${collection.color} bg-opacity-10 border-b relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        {collection.title}
                        <Badge variant="secondary" className="rounded-full px-2.5 ml-2">
                          {collection.count}
                        </Badge>
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <StarIcon className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardDescription className="mt-1">{collection.description}</CardDescription>
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
                  <span className="text-xs text-muted-foreground">{collection.count} bookmarks</span>
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
        </div>
      </main>
    </div>
  )
}