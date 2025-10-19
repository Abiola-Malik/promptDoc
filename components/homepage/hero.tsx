import { Button } from "@/components/ui/button"
import { ArrowRight, Play } from "lucide-react"

export default function Hero() {
  return (
    <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
          {/* Content */}
          <div className="flex flex-col gap-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground text-balance leading-tight">
              Generate Beautiful Code Documentation — Instantly.
            </h1>
            <p className="text-lg text-muted-foreground text-balance">
              PromptDoc uses AI to turn your code into clean, structured documentation with just one prompt. Save hours
              of writing and keep your docs always in sync.
            </p>

            {/* Trust Badges */}
            <div className="flex flex-col gap-3 pt-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-primary"></div>
                Used by developers worldwide
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-primary"></div>
                Secure with enterprise-grade encryption
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
                Start for Free
                <ArrowRight size={18} />
              </Button>
              <Button size="lg" variant="outline" className="gap-2 bg-transparent">
                <Play size={18} />
                Watch Demo
              </Button>
            </div>
          </div>

          {/* Hero Illustration */}
          <div className="relative h-96 lg:h-full min-h-96 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 border border-border flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="space-y-4 w-full max-w-xs px-6">
                <div className="bg-card border border-border rounded-lg p-4 space-y-2">
                  <div className="h-2 w-24 bg-primary/20 rounded"></div>
                  <div className="h-2 w-32 bg-primary/10 rounded"></div>
                  <div className="h-2 w-20 bg-primary/10 rounded"></div>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 h-12 bg-primary/20 rounded-lg flex items-center justify-center text-xs text-primary font-semibold">
                    Input Code
                  </div>
                  <div className="flex-1 h-12 bg-accent/20 rounded-lg flex items-center justify-center text-xs text-accent font-semibold">
                    AI Magic ✨
                  </div>
                </div>
                <div className="bg-card border border-border rounded-lg p-4 space-y-2">
                  <div className="h-2 w-full bg-primary/20 rounded"></div>
                  <div className="h-2 w-full bg-primary/10 rounded"></div>
                  <div className="h-2 w-3/4 bg-primary/10 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
