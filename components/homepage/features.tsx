import { Card } from "@/components/ui/card"
import { Zap, GitBranch, Download, Users } from "lucide-react"

const features = [
  {
    icon: Zap,
    title: "AI-Powered Documentation",
    description: "Leverage advanced AI to generate comprehensive documentation from your code in seconds.",
  },
  {
    icon: GitBranch,
    title: "Versioned for Every Commit",
    description: "Automatically track documentation changes alongside your code commits.",
  },
  {
    icon: Download,
    title: "Markdown & PDF Export",
    description: "Export your documentation in multiple formats for easy sharing and distribution.",
  },
  {
    icon: Users,
    title: "Collaborative Editing",
    description: "Work together with your team to refine and improve documentation in real-time.",
  },
]

export default function Features() {
  return (
    <section id="features" className="px-4 py-20 sm:px-6 lg:px-8 bg-secondary/30">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Powerful Features for Modern Teams</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to create, manage, and maintain world-class documentation.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card
                key={index}
                className="p-6 border border-border bg-card hover:shadow-lg hover:border-primary/50 transition-all duration-300 cursor-pointer group"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
