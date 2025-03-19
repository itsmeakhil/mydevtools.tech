import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shlink - Fast & Simple URL Shortener",
  description:
    "Create short, custom links for your long URLs easily and track your link performance with detailed statistics.",
};

export default function UrlShortenerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div>{children}</div>;
}