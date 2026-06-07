import Hero from "@/app/(home)/components/homepage/hero";
import Features from "@/app/(home)/components/homepage/features";
import HowItWorks from "@/app/(home)/components/homepage/how-it-works";
import Showcase from "@/app/(home)/components/homepage/showcase";
import BlogPreview from "@/app/(home)/components/homepage/blog-preview";
import CTABanner from "@/app/(home)/components/homepage/cta-banner";
import Footer from "@/app/(home)/components/homepage/footer";

export const metadata = {
  title: "PromptDoc - AI-Powered Documentation for Developers",
  description:
    "Generate beautiful code documentation instantly with AI. Turn your code into clean, structured documentation with just one prompt.",
  openGraph: {
    title: "PromptDoc - AI-Powered Documentation for Developers",
    description: "Generate beautiful code documentation instantly with AI.",
    type: "website",
  },
};

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Hero />
      <Features />
      <HowItWorks />
      <Showcase />
      <BlogPreview />
      <CTABanner />
      <Footer />
    </main>
  );
}
