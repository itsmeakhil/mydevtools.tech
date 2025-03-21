// "use client"

// import { useState } from "react"
// import Link from "next/link"
// import { Button } from "@/components/ui/button"
// import { PlusIcon, StarIcon } from "lucide-react"
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuCheckboxItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu"
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog"
// import { Label } from "@/components/ui/label"
// import { Input } from "@/components/ui/input"

// // Sample collections data
// const allCollections = [
//   { id: "1", name: "Development", isQuickAccess: true },
//   { id: "2", name: "Design", isQuickAccess: true },
//   { id: "3", name: "Reading List", isQuickAccess: true },
//   { id: "4", name: "Productivity", isQuickAccess: false },
//   { id: "5", name: "Learning", isQuickAccess: false },
// ]

// export function QuickAccessMenu() {
//   const [collections, setCollections] = useState(allCollections)
//   const quickAccessCollections = collections.filter((c) => c.isQuickAccess)

//   const toggleQuickAccess = (id: string) => {
//     setCollections(
//       collections.map((collection) =>
//         collection.id === id ? { ...collection, isQuickAccess: !collection.isQuickAccess } : collection,
//       ),
//     )
//   }

//   return (
//     <div>
//       <div className="flex items-center justify-between mb-2">
//         <h3 className="font-medium">Quick Access</h3>
//         <DropdownMenu>
//           <DropdownMenuTrigger asChild>
//             <Button variant="ghost" size="icon" className="h-6 w-6">
//               <PlusIcon className="h-4 w-4" />
//             </Button>
//           </DropdownMenuTrigger>
//           <DropdownMenuContent align="end" className="w-56">
//             <DropdownMenuLabel>Manage Quick Access</DropdownMenuLabel>
//             <DropdownMenuSeparator />
//             {collections.map((collection) => (
//               <DropdownMenuCheckboxItem
//                 key={collection.id}
//                 checked={collection.isQuickAccess}
//                 onCheckedChange={() => toggleQuickAccess(collection.id)}
//               >
//                 {collection.name}
//               </DropdownMenuCheckboxItem>
//             ))}
//             <DropdownMenuSeparator />
//             <Dialog>
//               <DialogTrigger asChild>
//                 <Button variant="ghost" size="sm" className="w-full justify-start">
//                   <PlusIcon className="h-4 w-4 mr-2" />
//                   Create New Collection
//                 </Button>
//               </DialogTrigger>
//               <DialogContent className="sm:max-w-[425px]">
//                 <DialogHeader>
//                   <DialogTitle>Create Collection</DialogTitle>
//                   <DialogDescription>Create a new collection to organize your bookmarks.</DialogDescription>
//                 </DialogHeader>
//                 <div className="grid gap-4 py-4">
//                   <div className="grid gap-2">
//                     <Label htmlFor="name">Name</Label>
//                     <Input id="name" placeholder="Collection name" />
//                   </div>
//                   <div className="flex items-center space-x-2">
//                     <input type="checkbox" id="quick-access" className="rounded border-gray-300" defaultChecked />
//                     <Label htmlFor="quick-access">Add to Quick Access</Label>
//                   </div>
//                 </div>
//                 <DialogFooter>
//                   <Button type="submit">Create Collection</Button>
//                 </DialogFooter>
//               </DialogContent>
//             </Dialog>
//           </DropdownMenuContent>
//         </DropdownMenu>
//       </div>
//       <nav className="space-y-1">
//         {quickAccessCollections.map((collection) => (
//           <Link
//             key={collection.id}
//             href={`/collections/${collection.name.toLowerCase()}`}
//             className="flex items-center justify-between px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
//           >
//             <span>{collection.name}</span>
//             <StarIcon className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
//           </Link>
//         ))}
//         {quickAccessCollections.length === 0 && (
//           <p className="text-xs text-muted-foreground px-3 py-2">No collections in Quick Access</p>
//         )}
//       </nav>
//     </div>
//   )
// }

