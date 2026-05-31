'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/shared/navbar";
import { Zap, Search, BookOpen, BarChart3, Brain } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-24 bg-gradient-to-b from-blue-50 to-white">
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-1.5 text-sm text-blue-700 mb-6">
          <Zap className="h-3.5 w-3.5" />
          Your personal API catalog
        </div>
        <h1 className="text-5xl font-bold tracking-tight text-gray-900 max-w-3xl mb-6">
          Discover, Save & Track{" "}
          <span className="text-blue-600">Free APIs</span> in One Place
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mb-8">
          UnifyAPIs is a searchable catalog of high-quality free & freemium
          public APIs. Save your favorites, track usage, and get AI-powered
          recommendations.
        </p>
        <div className="flex gap-4">
          <Button size="lg" asChild>
            <Link href="/apis">Browse APIs</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/login">Get started free</Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything you need to manage APIs
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Search,
                title: "Search & Discover",
                desc: "Browse curated free APIs with filters by category, key requirements, and tags.",
              },
              {
                icon: BookOpen,
                title: "Personal Library",
                desc: "Save your favorite APIs to a personal library with notes and custom thresholds.",
              },
              {
                icon: BarChart3,
                title: "Usage Tracking",
                desc: "Log API calls manually and get alerts when you approach free tier limits.",
              },
              {
                icon: Brain,
                title: "AI Assistance",
                desc: "Get recommendations for your use case and auto-generated code snippets.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="flex flex-col items-center text-center p-6 rounded-xl border bg-card"
              >
                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                  <Icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-blue-600 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">
          Start building with the best free APIs
        </h2>
        <p className="text-blue-100 mb-8 max-w-xl mx-auto">
          Join developers who use UnifyAPIs to streamline their API discovery workflow.
        </p>
        <Button size="lg" variant="secondary" asChild>
          <Link href="/apis">Explore the catalog</Link>
        </Button>
      </section>

      <footer className="py-8 text-center text-sm text-muted-foreground border-t">
        &copy; {new Date().getFullYear()} UnifyAPIs. Built with love for developers.
      </footer>
    </div>
  );
}
