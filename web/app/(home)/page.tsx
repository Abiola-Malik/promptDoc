import Hero from "@/app/(home)/homepage/hero";
import Features from "@/app/(home)/homepage/features";
import HowItWorks from "@/app/(home)/homepage/how-it-works";
import Showcase from "@/app/(home)/homepage/showcase";
import BlogPreview from "@/app/(home)/homepage/blog-preview";
import CTABanner from "@/app/(home)/homepage/cta-banner";
import Footer from "@/app/(home)/homepage/footer";

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
