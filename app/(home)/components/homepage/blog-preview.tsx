import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const blogPosts = [
  {
    title: "How to Write Better API Documentation",
    excerpt:
      "Learn best practices for creating clear, comprehensive API documentation that developers love.",
    image: "/api-documentation-concept.png",
  },
  {
    title: "AI-Powered Documentation: The Future is Here",
    excerpt:
      "Explore how artificial intelligence is revolutionizing the way we create and maintain technical documentation.",
    image: "/ai-documentation.jpg",
  },
  {
    title: "Documentation Best Practices for Open Source",
    excerpt:
      "Essential tips for maintaining high-quality documentation in open source projects.",
    image: "/open-source-documentation.jpg",
  },
];

export default function BlogPreview() {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8 bg-secondary/30">
      <div className="mx-auto max-w-6xl" data-aos="fade-up">
        <div className="mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Latest from the PromptDoc Blog
          </h2>
          <p className="text-lg text-muted-foreground">
            Tips, tricks, and insights for better documentation.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-3 mb-12">
          {blogPosts.map((post, index) => (
            <Card
              key={index}
              className="overflow-hidden border border-border bg-card hover:shadow-lg transition-shadow cursor-pointer group"
            >
              <div className="relative h-48 bg-gradient-to-br from-primary/10 to-accent/10 overflow-hidden">
                <Image
                  src={post.image || "/placeholder.svg"}
                  alt={post.title}
                  fill={true}
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {post.excerpt}
                </p>
              </div>
            </Card>
          ))}
        </div>
        <div className="text-center">
          <Link href="/blog">
            <Button variant="outline" className="gap-2 bg-transparent">
              View all articles
              <ArrowRight size={18} />
            </Button>
          </Link>
        </div>{" "}
      </div>
    </section>
  );
}
