import { DialogTrigger } from "@/components/ui/dialog"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  BookmarkIcon,
  PlusIcon,
  SearchIcon,
  PencilIcon,
  TrashIcon,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Sample tags data
const tags = [
  {
    id: "1",
    name: "development",
    bookmarkCount: 45,
    createdAt: "2023-10-15T10:30:00Z",
  },
  {
    id: "2",
    name: "design",
    bookmarkCount: 32,
    createdAt: "2023-10-20T14:20:00Z",
  },
  {
    id: "3",
    name: "resources",
    bookmarkCount: 28,
    createdAt: "2023-10-25T09:15:00Z",
  },
  {
    id: "4",
    name: "tools",
    bookmarkCount: 24,
    createdAt: "2023-11-01T16:45:00Z",
  },
  {
    id: "5",
    name: "tutorials",
    bookmarkCount: 19,
    createdAt: "2023-11-05T11:30:00Z",
  },
  {
    id: "6",
    name: "javascript",
    bookmarkCount: 17,
    createdAt: "2023-11-10T13:20:00Z",
  },
  {
    id: "7",
    name: "css",
    bookmarkCount: 15,
    createdAt: "2023-11-15T15:10:00Z",
  },
  {
    id: "8",
    name: "react",
    bookmarkCount: 14,
    createdAt: "2023-11-20T10:05:00Z",
  },
  {
    id: "9",
    name: "nextjs",
    bookmarkCount: 12,
    createdAt: "2023-11-25T09:30:00Z",
  },
  {
    id: "10",
    name: "productivity",
    bookmarkCount: 10,
    createdAt: "2023-11-30T14:45:00Z",
  },
]

export default function TagsPage() {
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
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
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
          <Link href="/tags" className="flex items-center gap-3 px-3 py-2 rounded-md bg-accent text-accent-foreground">
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
          <h1 className="text-2xl font-bold">Tags</h1>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <PlusIcon className="h-4 w-4 mr-2" />
                New Tag
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create Tag</DialogTitle>
                <DialogDescription>Create a new tag to categorize your bookmarks.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Tag name" />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Create Tag</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="relative max-w-md mb-6">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search tags..." className="pl-9" />
        </div>

        {/* Popular Tags */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Popular Tags</h3>
            <div className="flex flex-wrap gap-2">
              {tags.slice(0, 5).map((tag) => (
                <Badge key={tag.id} variant="outline" className="px-3 py-1">
                  {tag.name} ({tag.bookmarkCount})
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tags table */}
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tag</TableHead>
                <TableHead>Bookmarks</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tags.map((tag) => (
                <TableRow key={tag.id}>
                  <TableCell>
                    <Badge variant="secondary">{tag.name}</Badge>
                  </TableCell>
                  <TableCell>{tag.bookmarkCount}</TableCell>
                  <TableCell>{new Date(tag.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                        <Link href={`/bookmarks?tag=${tag.name}`}>
                          <BookmarkIcon className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Edit Tag</DialogTitle>
                            <DialogDescription>
                              Update the tag name. This will update all bookmarks with this tag.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                              <Label htmlFor="edit-name">Name</Label>
                              <Input id="edit-name" defaultValue={tag.name} />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button type="submit">Save Changes</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Delete Tag</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to delete this tag? This will remove the tag from all bookmarks.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button variant="outline">Cancel</Button>
                            <Button variant="destructive">Delete</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  )
}

