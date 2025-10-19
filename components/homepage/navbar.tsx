"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-foreground">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
            PD
          </div>
          PromptDoc
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition">
            Features
          </Link>
          <Link href="#docs" className="text-sm text-muted-foreground hover:text-foreground transition">
            Docs
          </Link>
          <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition">
            Pricing
          </Link>
          <Link href="#about" className="text-sm text-muted-foreground hover:text-foreground transition">
            About
          </Link>
          <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition">
            Login
          </Link>
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:block">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Get Started Free</Button>
        </div>

        {/* Mobile Menu Button */}
        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 text-foreground" aria-label="Toggle menu">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur">
          <div className="flex flex-col gap-4 px-4 py-4">
            <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition">
              Features
            </Link>
            <Link href="#docs" className="text-sm text-muted-foreground hover:text-foreground transition">
              Docs
            </Link>
            <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition">
              Pricing
            </Link>
            <Link href="#about" className="text-sm text-muted-foreground hover:text-foreground transition">
              About
            </Link>
            <Link href="#login" className="text-sm text-muted-foreground hover:text-foreground transition">
              Login
            </Link>
            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">Get Started Free</Button>
          </div>
        </div>
      )}
    </header>
  )
}
