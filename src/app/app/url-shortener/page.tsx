import type { Metadata } from "next"
import UrlShortener from "./components/UrlShortener"
import Stats from "./components/Stats"

export const metadata: Metadata = {
  title: "Shlink - Fast & Simple URL Shortener",
  description:
    "Create short, custom links for your long URLs easily and track your link performance with detailed statistics.",
}

export default function Home() {
    return (
        <div className="min-h-screen p-6 lg:ml-[var(--sidebar-width)] flex justify-center ">
      <main className="w-full max-w-2xl"> {/* Adjust width as needed */}
        <h1 className="text-4xl font-bold text-center mb-8">Fast & Simple URL Shortener</h1>
        <p className="text-center text-gray-600 mb-12">
          Create short, memorable links for your long URLs using this powerful tool. Track your link performance with
          detailed statistics.
        </p>
        <UrlShortener />
        <Stats />
      </main>
      </div>
    )
  }
  

