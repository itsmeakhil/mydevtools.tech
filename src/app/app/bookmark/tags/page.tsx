"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { db, auth } from "../../../../database/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
} from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookmarkIcon,
  PlusIcon,
  SearchIcon,
  PencilIcon,
  TrashIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Define Tag type
interface Tag {
  name: string;
  bookmarkCount: number;
  createdAt: string;
}

export default function TagsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true); // Separate state for auth loading
  const [tags, setTags] = useState<Tag[]>([]);
  const [dataLoading, setDataLoading] = useState(true); // Renamed for clarity
  const [error, setError] = useState<string | null>(null);
  const [newTag, setNewTag] = useState("");
  const [editTag, setEditTag] = useState<{ oldName: string; newName: string }>({
    oldName: "",
    newName: "",
  });
  const [searchQuery, setSearchQuery] = useState("");

  // Monitor authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false); // Auth state is resolved
    });
    return () => unsubscribe();
  }, []);

  // Fetch tags from bookmarks
  useEffect(() => {
    const fetchTags = async () => {
      if (!user) {
        setTags([]);
        setDataLoading(false);
        return;
      }

      try {
        setDataLoading(true);
        const bookmarksRef = collection(db, `users/${user.uid}/bookmarks`);
        const snapshot = await getDocs(bookmarksRef);

        // Aggregate tags
        const tagMap: { [key: string]: { count: number; earliestDate: string } } = {};
        snapshot.docs.forEach((doc) => {
          const bookmark = doc.data();
          const tags = bookmark.tags || [];
          const dateAdded = bookmark.dateAdded || new Date().toISOString();

          tags.forEach((tag: string) => {
            if (tagMap[tag]) {
              tagMap[tag].count += 1;
              if (new Date(dateAdded) < new Date(tagMap[tag].earliestDate)) {
                tagMap[tag].earliestDate = dateAdded;
              }
            } else {
              tagMap[tag] = {
                count: 1,
                earliestDate: dateAdded,
              };
            }
          });
        });

        // Convert tagMap to array and sort by bookmark count
        const tagsArray: Tag[] = Object.entries(tagMap)
          .map(([name, data]) => ({
            name,
            bookmarkCount: data.count,
            createdAt: data.earliestDate,
          }))
          .sort((a, b) => b.bookmarkCount - a.bookmarkCount);

        setTags(tagsArray);
      } catch (err) {
        console.error("Error fetching tags:", err);
        setError("Failed to load tags. Please try again.");
      } finally {
        setDataLoading(false);
      }
    };

    fetchTags();
  }, [user]);

  // Handle creating a new tag
  const handleCreateTag = async () => {
    if (!user) {
      alert("You must be logged in to create a tag.");
      return;
    }

    const trimmedTag = newTag.trim().toLowerCase();
    if (!trimmedTag) {
      alert("Tag name cannot be empty.");
      return;
    }

    if (tags.some((tag) => tag.name === trimmedTag)) {
      alert("This tag already exists.");
      return;
    }

    setTags([
      ...tags,
      {
        name: trimmedTag,
        bookmarkCount: 0,
        createdAt: new Date().toISOString(),
      },
    ]);
    setNewTag("");
  };

  // Handle editing a tag
  const handleEditTag = async (oldName: string) => {
    if (!user) {
      alert("You must be logged in to edit a tag.");
      return;
    }

    const newName = editTag.newName.trim().toLowerCase();
    if (!newName) {
      alert("New tag name cannot be empty.");
      return;
    }

    if (tags.some((tag) => tag.name === newName && tag.name !== oldName)) {
      alert("This tag name already exists.");
      return;
    }

    try {
      const bookmarksRef = collection(db, `users/${user.uid}/bookmarks`);
      const q = query(bookmarksRef, where("tags", "array-contains", oldName));
      const snapshot = await getDocs(q);

      const updatePromises = snapshot.docs.map(async (bookmarkDoc) => {
        const bookmark = bookmarkDoc.data();
        const updatedTags = bookmark.tags.map((tag: string) =>
          tag === oldName ? newName : tag
        );
        await updateDoc(doc(db, `users/${user.uid}/bookmarks`, bookmarkDoc.id), {
          tags: updatedTags,
        });
      });

      await Promise.all(updatePromises);

      setTags(
        tags.map((tag) =>
          tag.name === oldName ? { ...tag, name: newName } : tag
        )
      );
      setEditTag({ oldName: "", newName: "" });
    } catch (err) {
      console.error("Error editing tag:", err);
      alert("Failed to edit tag. Please try again.");
    }
  };

  // Handle deleting a tag
  const handleDeleteTag = async (tagName: string) => {
    if (!user) {
      alert("You must be logged in to delete a tag.");
      return;
    }

    try {
      const bookmarksRef = collection(db, `users/${user.uid}/bookmarks`);
      const q = query(bookmarksRef, where("tags", "array-contains", tagName));
      const snapshot = await getDocs(q);

      const updatePromises = snapshot.docs.map(async (bookmarkDoc) => {
        const bookmark = bookmarkDoc.data();
        const updatedTags = bookmark.tags.filter((tag: string) => tag !== tagName);
        await updateDoc(doc(db, `users/${user.uid}/bookmarks`, bookmarkDoc.id), {
          tags: updatedTags,
        });
      });

      await Promise.all(updatePromises);

      setTags(tags.filter((tag) => tag.name !== tagName));
    } catch (err) {
      console.error("Error deleting tag:", err);
      alert("Failed to delete tag. Please try again.");
    }
  };

  // Filter tags based on search query
  const filteredTags = tags.filter((tag) =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Auth loading state
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto mb-2"></div>
          <p>Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Authentication check
  if (!user) {
    window.location.href = "/login";
    return null;
  }

  // Data loading state
  if (dataLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto mb-2"></div>
          <p>Loading tags...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-red-500">{error}</p>
          <Button variant="outline" className="mt-4" asChild>
            <Link href="/app/bookmark/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
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
                <DialogDescription>
                  Create a new tag to categorize your bookmarks. You can apply this tag to bookmarks later.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="Tag name"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleCreateTag}>
                  Create Tag
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="relative max-w-md mb-6">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tags..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Popular Tags */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Popular Tags</h3>
            <div className="flex flex-wrap gap-2">
              {tags.slice(0, 5).map((tag) => (
                <Badge key={tag.name} variant="outline" className="px-3 py-1">
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
              {filteredTags.map((tag) => (
                <TableRow key={tag.name}>
                  <TableCell>
                    <Badge variant="secondary">{tag.name}</Badge>
                  </TableCell>
                  <TableCell>{tag.bookmarkCount}</TableCell>
                  <TableCell>
                    {new Date(tag.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        asChild
                      >
                        <Link href={`/app/bookmark/bookmarks?tag=${tag.name}`}>
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
                              <Input
                                id="edit-name"
                                defaultValue={tag.name}
                                onChange={(e) =>
                                  setEditTag({
                                    oldName: tag.name,
                                    newName: e.target.value,
                                  })
                                }
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              type="submit"
                              onClick={() => handleEditTag(tag.name)}
                            >
                              Save Changes
                            </Button>
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
                            <Button
                              variant="destructive"
                              onClick={() => handleDeleteTag(tag.name)}
                            >
                              Delete
                            </Button>
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
  );
}