// import Link from "next/link"
// import { Badge } from "@/components/ui/badge"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent } from "@/components/ui/card"

// interface PreviewLink {
//   title: string
//   url: string
//   domain: string
// }

// interface CollectionCardProps {
//   title: string
//   count: number
//   description: string
//   previewLinks: PreviewLink[]
//   slug: string
// }

// export function CollectionCard({ title, count, description, previewLinks, slug }: CollectionCardProps) {
//   return (
//     <Card>
//       <CardContent className="p-6">
//         <div className="flex justify-between items-center mb-4">
//           <h3 className="font-semibold">{title}</h3>
//           <Badge variant="secondary">{count}</Badge>
//         </div>
//         <p className="text-sm text-muted-foreground mb-4">{description}</p>

//         {/* Preview Links */}
//         <div className="space-y-3">
//           {previewLinks.map((link, index) => (
//             <div key={index} className="border-l-2 border-primary pl-3 py-1">
//               <Link href={link.url} className="text-sm font-medium hover:underline block">
//                 {link.title}
//               </Link>
//               <p className="text-xs text-muted-foreground">{link.domain}</p>
//             </div>
//           ))}
//         </div>

//         <Button variant="ghost" size="sm" className="w-full mt-4" asChild>
//           <Link href={`/collections/${slug}`}>View all</Link>
//         </Button>
//       </CardContent>
//     </Card>
//   )
// }

