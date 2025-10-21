import { Card } from "@/components/ui/card"
import { Upload, Zap, Download } from "lucide-react"

const steps = [
  {
    icon: Upload,
    title: "Upload or Paste Your Code",
    description: "Simply upload your code files or paste them directly into PromptDoc.",
  },
  {
    icon: Zap,
    title: "Prompt the AI for Style or Depth",
    description: "Customize the documentation style, depth, and format with natural language prompts.",
  },
  {
    icon: Download,
    title: "Review, Edit, and Export",
    description: "Review the generated documentation, make edits, and export in your preferred format.",
  },
]

export default function HowItWorks() {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl" data-aos="fade-up">
        <div className="mb-16 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">How It Works</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Three simple steps to beautiful documentation.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div key={index} className="relative">
                <Card className="p-8 border border-border bg-card h-full">
                  <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="mb-3 text-xl font-semibold text-foreground">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </Card>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <div className="h-1 w-8 bg-primary/20"></div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
