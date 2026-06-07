// app/features/page.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  MessageSquare,
  FolderOpen,
  Sparkles,
  Zap,
  Shield,
  Globe,
  CheckCircle2,
} from "lucide-react";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Features",
  description:
    "AI-powered documentation that understands your entire codebase. Chat, explore files, and get instantly generated docs.",
};
export default function FeaturesPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="border-b border-border bg-gradient-to-b from-background to-muted/30 py-20 md:py-32">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-4" variant="secondary">
            <Sparkles className="w-3 h-3 mr-1" />
            Powered by AI
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            Everything you need to understand code, instantly
          </h1>
          <p className="mt-6 text-xl text-muted-foreground max-w-3xl mx-auto">
            PromptDoc combines beautiful AI-generated documentation with an
            intelligent chat interface and full file exploration — all in one
            place.
          </p>
          {/* <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/dashboard">Try the Demo</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/pricing">View Pricing</Link>
            </Button>
          </div> */}
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Powerful features for modern teams
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              From onboarding new developers to maintaining complex codebases
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1: AI Documentation */}
            <Card className="border-border hover:border-primary/50 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>AI-Generated Documentation</CardTitle>
                <CardDescription>
                  Automatically create clear, structured Markdown docs from your
                  entire codebase.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 inline mr-2 text-green-500" />
                  Architecture overview
                </p>
                <p className="text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 inline mr-2 text-green-500" />
                  API endpoints & usage examples
                </p>
                <p className="text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 inline mr-2 text-green-500" />
                  Component breakdowns
                </p>
                <p className="text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 inline mr-2 text-green-500" />
                  Setup & deployment guides
                </p>
              </CardContent>
            </Card>

            {/* Feature 2: Intelligent Chat */}
            <Card className="border-border hover:border-primary/50 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <MessageSquare className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Chat with Your Codebase</CardTitle>
                <CardDescription>
                  Ask questions in natural language and get accurate answers
                  with source references.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 inline mr-2 text-green-500" />
                  &ldquo;How does authentication work?&rdquo;
                </p>
                <p className="text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 inline mr-2 text-green-500" />
                  &ldquo;Show me all API routes&rdquo;
                </p>
                <p className="text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 inline mr-2 text-green-500" />
                  &ldquo;Explain this component&rdquo;
                </p>
                <p className="text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 inline mr-2 text-green-500" />
                  Context-aware responses
                </p>
              </CardContent>
            </Card>

            {/* Feature 3: File Explorer */}
            <Card className="border-border hover:border-primary/50 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <FolderOpen className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Full File Explorer</CardTitle>
                <CardDescription>
                  Browse your project structure with syntax-highlighted file
                  previews.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 inline mr-2 text-green-500" />
                  Tree view navigation
                </p>
                <p className="text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 inline mr-2 text-green-500" />
                  Code syntax highlighting
                </p>
                <p className="text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 inline mr-2 text-green-500" />
                  Search across files
                </p>
                <p className="text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 inline mr-2 text-green-500" />
                  Instant file preview
                </p>
              </CardContent>
            </Card>

            {/* Feature 4: Speed & Performance */}
            <Card className="border-border hover:border-primary/50 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Blazing Fast</CardTitle>
                <CardDescription>
                  Optimized for speed with lazy loading and efficient
                  processing.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 inline mr-2 text-green-500" />
                  Instant tab switching
                </p>
                <p className="text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 inline mr-2 text-green-500" />
                  On-demand code loading
                </p>
                <p className="text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 inline mr-2 text-green-500" />
                  Real-time progress tracking
                </p>
              </CardContent>
            </Card>

            {/* Feature 5: Security */}
            <Card className="border-border hover:border-primary/50 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Secure & Private</CardTitle>
                <CardDescription>
                  Your code never leaves your control.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 inline mr-2 text-green-500" />
                  End-to-end encryption
                </p>
                <p className="text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 inline mr-2 text-green-500" />
                  No code storage beyond your projects
                </p>
                <p className="text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 inline mr-2 text-green-500" />
                  SOC 2 compliant processing
                </p>
              </CardContent>
            </Card>

            {/* Feature 6: Multi-Language */}
            <Card className="border-border hover:border-primary/50 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Globe className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Any Language, Any Framework</CardTitle>
                <CardDescription>
                  Works with all major languages and frameworks out of the box.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">JavaScript / TypeScript</Badge>
                  <Badge variant="outline">Python</Badge>
                  <Badge variant="outline">React / Next.js</Badge>
                  <Badge variant="outline">Node.js</Badge>
                  <Badge variant="outline">Go</Badge>
                  <Badge variant="outline">Rust</Badge>
                  <Badge variant="outline">+ more</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary/5 border-y border-border">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Document your codebase like never before!
          </h2>
          {/* <p className="mt-6 text-lg text-muted-foreground">
            Start with our interactive demo — no signup required.
          </p>
          <div className="mt-10">
            <Button asChild size="lg" className="px-8">
              <Link href="/dashboard">View Live Demo</Link>
            </Button>
          </div> */}
        </div>
      </section>
    </main>
  );
}
