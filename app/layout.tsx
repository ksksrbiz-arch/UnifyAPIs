import type { Metadata } from "next";
import "./globals.css";
import { TRPCProvider } from "@/components/shared/trpc-provider";

export const metadata: Metadata = {
  title: "UnifyAPIs — Your personal catalog of free & freemium APIs",
  description:
    "Discover, save, and track usage of free & freemium public APIs with AI-powered recommendations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <TRPCProvider>{children}</TRPCProvider>
      </body>
    </html>
  );
}
