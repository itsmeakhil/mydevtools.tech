// "use client";

// import { useState, ChangeEvent } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Switch } from "@/components/ui/switch";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// interface Bookmark {
//   id: string;
//   title: string;
//   description: string;
//   url: string;
//   favicon: string;
//   tags: string[];
//   collection: string;
//   dateAdded: string | Timestamp;
//   isFavorite: boolean;
//   visitCount: number;
// }

// interface Collection {
//   id: string;
//   name: string;
//   color: string;
// }

// interface BookmarkEditFormProps {
//   bookmark: Bookmark;
//   onSave: (updatedBookmark: Bookmark) => void;
//   collections: Collection[];
// }

// export default function BookmarkEditForm({ bookmark, onSave, collections }: BookmarkEditFormProps) {
//   const [editBookmark, setEditBookmark] = useState<Bookmark>({ ...bookmark });

//   const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     const { id, value } = e.target;
//     setEditBookmark((prev) => ({ ...prev, [id.replace("edit-", "")]: value }));
//   };

//   const handleSelectChange = (value: string) => {
//     setEditBookmark((prev) => ({ ...prev, collection: value }));
//   };

//   const handleSwitchChange = (checked: boolean) => {
//     setEditBookmark((prev) => ({ ...prev, isFavorite: checked }));
//   };

//   const handleSubmit = () => {
//     const updatedBookmark = {
//       ...editBookmark,
//       tags: editBookmark.tags.join(", ").split(",").map((tag) => tag.trim()).filter((tag) => tag.length > 0),
//     };
//     onSave(updatedBookmark);
//   };

//   return (
//     <div className="grid gap-4 py-4">
//       <div className="grid gap-2">
//         <Label htmlFor="edit-url">URL</Label>
//         <Input id="edit-url" value={editBookmark.url} onChange={handleInputChange} />
//       </div>
//       <div className="grid gap-2">
//         <Label htmlFor="edit-title">Title</Label>
//         <Input id="edit-title" value={editBookmark.title} onChange={handleInputChange} />
//       </div>
//       <div className="grid gap-2">
//         <Label htmlFor="edit-description">Description</Label>
//         <Textarea id="edit-description" value={editBookmark.description} onChange={handleInputChange} />
//       </div>
//       <div className="grid gap-2">
//         <Label htmlFor="edit-collection">Collection</Label>
//         <Select onValueChange={handleSelectChange} defaultValue={editBookmark.collection}>
//           <SelectTrigger id="edit-collection">
//             <SelectValue placeholder="Select a collection" />
//           </SelectTrigger>
//           <SelectContent>
//             {collections.map((collection) => (
//               <SelectItem key={collection.id} value={collection.name}>
//                 {collection.name}
//               </SelectItem>
//             ))}
//             <SelectItem value="Uncategorized">Uncategorized</SelectItem>
//           </SelectContent>
//         </Select>
//       </div>
//       <div className="grid gap-2">
//         <Label htmlFor="edit-tags">Tags (separate with commas)</Label>
//         <Input
//           id="edit-tags"
//           value={editBookmark.tags.join(", ")}
//           onChange={(e) =>
//             setEditBookmark((prev) => ({
//               ...prev,
//               tags: e.target.value.split(",").map((tag) => tag.trim()),
//             }))
//           }
//         />
//       </div>
//       <div className="flex items-center space-x-2 pt-2">
//         <Switch id="edit-favorite" checked={editBookmark.isFavorite} onCheckedChange={handleSwitchChange} />
//         <Label htmlFor="edit-favorite">Mark as favorite</Label>
//       </div>
//       <div className="flex justify-end mt-4">
//         <Button onClick={handleSubmit}>Save changes</Button>
//       </div>
//     </div>
//   );
// }