"use client";

import type React from "react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { db, auth } from "../../../../database/firebase"; // Adjust path to your firebase.ts file
import { doc, setDoc } from "firebase/firestore";
import { useToast } from "@/components/ui/use-toast"; // Optional: for notifications

interface AddBookmarkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddBookmarkDialog({ open, onOpenChange }: AddBookmarkDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    url: "",
    tags: "",
    collection: "",
  });
  const { toast } = useToast(); // Optional: for success/error messages

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to add a bookmark.",
        variant: "destructive",
      });
      return;
    }

    const bookmarkData = {
      title: formData.title,
      url: formData.url,
      tags: formData.tags.split(",").map((tag) => tag.trim()), // Convert tags to array
      collection: formData.collection || "Uncategorized",
      createdAt: new Date().toISOString(),
      uid: user.uid, // Associate with the user's UID
    };

    try {
      // Save bookmark to Firestore under user's UID
      const bookmarkRef = doc(db, "users", user.uid, "bookmarks", `${Date.now()}`);
      await setDoc(bookmarkRef, bookmarkData);
      toast({
        title: "Success",
        description: "Bookmark added successfully!",
      });
      onOpenChange(false);
      setFormData({ title: "", url: "", tags: "", collection: "" });
    } catch (error) {
      console.error("Error adding bookmark:", error);
      toast({
        title: "Error",
        description: "Failed to add bookmark. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Bookmark</DialogTitle>
            <DialogDescription>Enter the details of your new bookmark here.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                placeholder="My Bookmark"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                name="url"
                placeholder="https://example.com"
                type="url"
                value={formData.url}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                name="tags"
                placeholder="Add tags (comma-separated)..."
                value={formData.tags}
                onChange={handleChange}
              />
              <p className="text-xs text-muted-foreground">Separate tags with commas</p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="collection">Collection</Label>
              <Select
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, collection: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a collection" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="development">Development</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="reading">Reading List</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="submit">Save Bookmark</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}