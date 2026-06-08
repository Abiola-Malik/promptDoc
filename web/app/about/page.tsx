// app/about/page.tsx
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Sparkles,
  Code2,
  Zap,
  Users,
  Globe,
  Heart,
  Rocket,
  Shield,
} from "lucide-react";

export const metadata = {
  title: "About",
  description:
    "We're building the future of codebase understanding — making documentation instant, interactive, and intelligent.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="border-b border-border bg-gradient-to-b from-background to-muted/30 py-20 md:py-32">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-4" variant="secondary">
            <Sparkles className="w-3 h-3 mr-1" />
            Our Mission
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            Documentation shouldn&apos;t be painful
          </h1>
          <p className="mt-6 text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            PromptDoc was born from a simple frustration: developers spend too
            much time reading outdated docs, digging through unfamiliar code,
            and answering the same onboarding questions over and over.
          </p>
          <p className="mt-6 text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            We believe AI can change that — by turning any codebase into
            beautiful, up-to-date documentation and an intelligent assistant
            that truly understands your project.
          </p>
        </div>
      </section>

      {/* Story / Values Section */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20 items-center">
            {/* Left: Text */}
            <div className="space-y-8">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Built for developers, by developers
              </h2>
              <div className="space-y-6 text-lg text-muted-foreground">
                <p>
                  We&apos;re a small team of engineers who have spent years
                  working on large codebases, open-source projects, and
                  fast-moving startups.
                </p>
                <p>
                  We&apos;ve felt the pain of joining a new project with no
                  docs, trying to understand legacy systems, and repeatedly
                  explaining the same architecture to new team members.
                </p>
                <p>
                  PromptDoc is our answer: an AI-powered tool that automatically
                  generates clear documentation, lets you chat with your code,
                  and explore files — all in a fast, beautiful interface.
                </p>
                <p>
                  No more stale READMEs. No more &quot;just read the code.&quot;
                  Just instant understanding.
                </p>
              </div>
            </div>

            {/* Right: Values Cards */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
              <Card className="border-border">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>Speed First</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Optimized for performance — lazy loading, instant tab
                    switching, and real-time feedback.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>Privacy Focused</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Your code is yours. We use secure, ephemeral processing and
                    never store your source beyond your projects.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Code2 className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>Developer Experience</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Clean UI, keyboard shortcuts, syntax highlighting —
                    everything designed to feel native and intuitive.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Globe className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>Framework Agnostic</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Works with any language or stack — React, Next.js, Python,
                    Go, Rust, and more.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Team / Future Vision */}
      <section className="py-20 md:py-28 bg-muted/50 border-y border-border">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            The future of code understanding
          </h2>
          <p className="mt-6 text-xl text-muted-foreground max-w-3xl mx-auto">
            We&apos;re just getting started. Our vision is to make every
            codebase self-documenting and instantly explorable — reducing
            onboarding time, improving code quality, and letting developers
            focus on building instead of explaining.
          </p>

          <div className="mt-12 flex flex-col sm:flex-row gap-6 justify-center items-center">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-primary" />
              <div className="text-left">
                <p className="font-semibold">Join thousands</p>
                <p className="text-sm text-muted-foreground">
                  of developers already using PromptDoc
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Heart className="w-8 h-8 text-primary" />
              <div className="text-left">
                <p className="font-semibold">Open & transparent</p>
                <p className="text-sm text-muted-foreground">
                  Roadmap and changelog publicly available
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Rocket className="w-8 h-8 text-primary" />
              <div className="text-left">
                <p className="font-semibold">Fast iteration</p>
                <p className="text-sm text-muted-foreground">
                  New features shipping every week
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to experience the future?
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">
            Try PromptDoc for free and see how AI-powered documentation can
            transform your workflow.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="px-8">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
            {/* <Button asChild variant="outline" size="lg">
              <Link href="/contact">Get in Touch</Link>
            </Button> */}
          </div>
        </div>
      </section>
    </main>
  );
}
