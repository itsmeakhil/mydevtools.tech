import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MyDevTools - Essential tools for Developers",
  keywords: [
    "Developer Tools",
    "JSON Formatter",
    "YAML to JSON Converter",
    "To-Do App",
    "Note-Taking",
    "Developer Productivity",
    "MyDevTools",
  ],
  description: "Your Ultimate Developer Toolkit Streamline your development workflow with MyDevTools, an all-in-one platform built for developers. From intuitive to-do lists and random note-taking features to essential utilities like JSON/YAML converters, formatters, and more, MyDevTools simplifies your daily coding tasks. Boost productivity, stay organized, and access a growing suite of tools tailored to meet the needs of modern developers—all in one place.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
