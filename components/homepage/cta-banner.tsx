import { Button } from "@/components/ui/button"
import { ArrowRight, Play } from "lucide-react"

export default function CTABanner() {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-lg bg-gradient-to-r from-primary to-primary/80 p-12 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-primary-foreground mb-4">
            Your code deserves world-class documentation.
          </h2>
          <p className="text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Join thousands of developers who are already saving hours with PromptDoc.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-primary-foreground hover:bg-primary-foreground/90 text-primary gap-2">
              Get Started Free
              <ArrowRight size={18} />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10 gap-2 bg-transparent"
            >
              <Play size={18} />
              View Demo
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
