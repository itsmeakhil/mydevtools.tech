import MacAddressLookup from "./Component/mac-address-lookup"

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center pt-8 p-4 bg-background">
      <MacAddressLookup />
    </main>
  )
}

