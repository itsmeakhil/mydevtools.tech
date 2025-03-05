import type { Metadata } from "next";
import UrlShortener from "./components/UrlShortener";
import Stats from "./components/Stats";

export const metadata: Metadata = {
  title: "Shlink - Fast & Simple URL Shortener",
  description:
    "Create short, custom links for your long URLs easily and track your link performance with detailed statistics.",
};

export default function Home() {
  return (
<div className="min-h-screen flex flex-col items-center justify-center p-16 dark:bg-black dark:text-white">
      <main className="w-full max-w-2xl border border-gray-300 bg-white dark:bg-gray-900 dark:border-gray-700 shadow rounded-xl p-6">
        <h1 className="text-4xl font-bold text-center mb-8 mt-2 dark:text-white">
          Fast & Simple URL Shortener
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-300 mb-8">
          Create short, memorable links for your long URLs using this powerful
          tool. Track your link performance with detailed statistics.
        </p>
        <UrlShortener />
        <Stats />
      </main>
    </div>
  );
}
