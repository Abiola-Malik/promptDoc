// app/privacy/page.tsx
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Shield,
  Lock,
  Server,
  Trash2,
  EyeOff,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { Separator } from "@radix-ui/react-separator";

export const metadata = {
  title: "Privacy Policy",
  description:
    "Learn how PromptDoc protects your privacy and handles your code securely.",
};

export default function PrivacyPage() {
  const lastUpdated = "January 6, 2026";

  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-b from-background to-muted/30 py-20 md:py-32">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-4" variant="secondary">
            <Shield className="w-3 h-3 mr-1" />
            Your Privacy Matters
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            Privacy Policy
          </h1>
          <p className="mt-6 text-xl text-muted-foreground max-w-3xl mx-auto">
            We take your privacy and code security seriously. PromptDoc is
            designed from the ground up to keep your intellectual property safe
            and private.
          </p>
          <p className="mt-4 text-lg text-muted-foreground">
            Last updated: {lastUpdated}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg dark:prose-invert max-w-none space-y-12">
            {/* Introduction */}
            <section>
              <h2 className="text-3xl font-bold flex items-center gap-3 mb-6">
                <Lock className="w-8 h-8 text-primary" />
                Your Code Is Private by Default
              </h2>
              <p>
                At PromptDoc, we understand that your source code is one of your
                most valuable assets. That&apos;s why privacy is not an
                afterthought — it&apos;s built into everything we do.
              </p>
              <p className="mt-4">
                We never train on your code. We never share it with third
                parties. We process it securely and delete it when you do.
              </p>
            </section>

            <Separator />

            {/* Key Principles */}
            <section>
              <h2 className="text-3xl font-bold mb-8">
                Our Core Privacy Principles
              </h2>
              <div className="grid gap-8 md:grid-cols-2">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <EyeOff className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      No Training on Your Data
                    </h3>
                    <p className="text-muted-foreground">
                      We do not use your uploaded code to train or improve any
                      AI models. Your code remains yours alone.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Server className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      Ephemeral Processing
                    </h3>
                    <p className="text-muted-foreground">
                      Code is processed in isolated, temporary environments and
                      automatically deleted after documentation generation is
                      complete.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Trash2 className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      You Control Deletion
                    </h3>
                    <p className="text-muted-foreground">
                      Delete a project at any time, and all associated code,
                      docs, and chat history are permanently removed from our
                      systems.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      Private Projects Only
                    </h3>
                    <p className="text-muted-foreground">
                      All projects are private by default. No public sharing
                      unless you explicitly enable it.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <Separator />

            {/* Data Collection */}
            <section>
              <h2 className="text-3xl font-bold mb-6">What We Collect</h2>
              <ul className="space-y-4 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                  <span>
                    Account information (email, name) when you sign up
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                  <span>
                    Your uploaded source code (only for generating docs and
                    chat)
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                  <span>Chat messages within your projects</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                  <span>
                    Anonymous usage analytics (via Vercel Analytics) to improve
                    the product
                  </span>
                </li>
              </ul>
              <p className="mt-6 text-muted-foreground">
                We do <strong>not</strong> collect payment information — all
                billing is handled securely by Stripe.
              </p>
            </section>

            <Separator />

            {/* Security */}
            <section>
              <h2 className="text-3xl font-bold mb-6">Security Measures</h2>
              <ul className="space-y-4 text-muted-foreground">
                <li>• End-to-end encryption for data in transit (TLS 1.3)</li>
                <li>• Encrypted at-rest storage</li>
                <li>• Regular security audits and penetration testing</li>
                <li>• SOC 2 compliant infrastructure (via Vercel)</li>
                <li>• Minimal data retention policies</li>
              </ul>
            </section>

            <Separator />

            {/* Contact & Changes */}
            <section>
              <h2 className="text-3xl font-bold mb-6">Questions or Changes</h2>
              <p className="text-muted-foreground">
                If you have any questions about this Privacy Policy or how we
                handle your data, please reach out at{" "}
                <a
                  href="mailto:hello@promptdoc.com"
                  className="text-primary hover:underline"
                >
                  hello@promptdoc.com
                </a>
                .
              </p>
              <p className="mt-4 text-muted-foreground">
                We may update this policy from time to time. We will notify you
                of any material changes via email or in-app notification.
              </p>
            </section>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary/5 border-y border-border">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to try PromptDoc with confidence?
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">
            Your code stays private. Always.
          </p>
          <div className="mt-10">
            <Button asChild size="lg" className="px-8">
              <Link href="/dashboard">Try the Demo</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
