import LoremIpsumGenerator from "./component/lorem-ipsum-generator"


export default function Home() {
  return (
   <div>
      <main className="min-h-screen flex items-center justify-center p-4 bg-background">
        <LoremIpsumGenerator />
      </main>
      </div>
  )
}