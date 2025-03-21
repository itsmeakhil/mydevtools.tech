// import Link from "next/link"
// import { Badge } from "@/components/ui/badge"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent } from "@/components/ui/card"
// import { ExternalLinkIcon, MoreVerticalIcon } from "lucide-react"

// interface BookmarkCardProps {
//   title: string
//   description: string
//   url: string
//   tags: string[]
// }

// export function BookmarkCard({ title, description, url, tags }: BookmarkCardProps) {
//   return (
//     <Card>
//       <CardContent className="p-6">
//         <div className="flex justify-between items-start mb-4">
//           <h3 className="text-lg font-semibold">{title}</h3>
//           <Button variant="ghost" size="icon">
//             <MoreVerticalIcon className="h-4 w-4" />
//           </Button>
//         </div>

//         <div className="border rounded-md p-4 mb-3">
//           <div className="flex justify-between items-start">
//             <p className="text-sm">{description}</p>
//             <Button variant="ghost" size="icon" className="h-6 w-6" asChild>
//               <Link href={url} target="_blank">
//                 <ExternalLinkIcon className="h-4 w-4" />
//               </Link>
//             </Button>
//           </div>
//           <div className="flex flex-wrap gap-2 mt-2">
//             {tags.map((tag) => (
//               <Badge key={tag} variant="secondary" className="text-xs">
//                 {tag}
//               </Badge>
//             ))}
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   )
// }

