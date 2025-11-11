import Link from "next/link"
import { Github, Twitter, Linkedin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/50">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4 mb-8">
          {/* Product */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition">
                  Changelog
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition">
                  About
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition">
                  Careers
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition">
                  Docs
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Follow Us</h3>
            <div className="flex gap-4">
              <Link href="#" aria-label="Follow us on Github" className="text-muted-foreground hover:text-foreground transition">
                <Github size={20} />
              </Link>
              <Link href="#" aria-label="Follow us on Twitter" className="text-muted-foreground hover:text-foreground transition">
                <Twitter size={20} />
              </Link>
              <Link href="#" aria-label="Follow us on LinkedIn" className="text-muted-foreground hover:text-foreground transition">
                <Linkedin size={20} />
              </Link>            </div>
          </div>
        </div>

        <div className="border-t border-border pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">© 2025 PromptDoc. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition">
              Privacy Policy
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
