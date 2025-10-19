import Navbar from "@/components/homepage/navbar"
import Hero from "@/components/homepage/hero"
import Features from "@/components/homepage/features"
import HowItWorks from "@/components/homepage/how-it-works"
import Showcase from "@/components/homepage/showcase"
import Pricing from "@/components/homepage/pricing"
import BlogPreview from "@/components/homepage/blog-preview"
import CTABanner from "@/components/homepage/cta-banner"
import Footer from "@/components/homepage/footer"

export const metadata = {
  title: "PromptDoc - AI-Powered Documentation for Developers",
  description:
    "Generate beautiful code documentation instantly with AI. Turn your code into clean, structured documentation with just one prompt.",
  openGraph: {
    title: "PromptDoc - AI-Powered Documentation for Developers",
    description: "Generate beautiful code documentation instantly with AI.",
    type: "website",
  },
}

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Showcase />
      <Pricing />
      <BlogPreview />
      <CTABanner />
      <Footer />
    </main>
  )
}
