"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function Showcase() {
  const [showAfter, setShowAfter] = useState(false)

  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8 bg-secondary/30">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">See the Difference</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Watch how PromptDoc transforms raw code into polished documentation.
          </p>
        </div>

        <div className="space-y-6">
          {/* Toggle Button */}
          <div className="flex justify-center">
            <div className="inline-flex gap-2 p-1 bg-secondary rounded-lg border border-border">
              <Button
                variant={!showAfter ? "default" : "ghost"}
                size="sm"
                onClick={() => setShowAfter(false)}
                className={!showAfter ? "bg-primary text-primary-foreground" : ""}
              >
                Before
              </Button>
              <Button
                variant={showAfter ? "default" : "ghost"}
                size="sm"
                onClick={() => setShowAfter(true)}
                className={showAfter ? "bg-primary text-primary-foreground" : ""}
              >
                After
              </Button>
            </div>
          </div>

          {/* Showcase Card */}
          <Card className="p-8 border border-border bg-card overflow-hidden">
            <div className="space-y-4">
              {!showAfter ? (
                <div className="space-y-3 font-mono text-sm">
                  <div className="text-muted-foreground">
                    <span className="text-primary">function</span> calculateTotal(items) {"{"}
                  </div>
                  <div className="text-muted-foreground ml-4">
                    <span className="text-primary">return</span> items.reduce((sum, item) =&gt; sum + item.price, 0)
                  </div>
                  <div className="text-muted-foreground">{"}"}</div>
                  <div className="text-muted-foreground mt-4">
                    <span className="text-primary">function</span> applyDiscount(total, percent) {"{"}
                  </div>
                  <div className="text-muted-foreground ml-4">
                    <span className="text-primary">return</span> total * (1 - percent / 100)
                  </div>
                  <div className="text-muted-foreground">{"}"}</div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">calculateTotal(items)</h3>
                    <p className="text-muted-foreground text-sm">
                      Calculates the total price of all items in the provided array by summing their individual prices.
                    </p>
                    <div className="mt-3 space-y-2 text-sm">
                      <div>
                        <span className="font-semibold text-foreground">Parameters:</span>
                      </div>
                      <div className="ml-4 text-muted-foreground">
                        <span className="text-primary">items</span> - Array of item objects with price property
                      </div>
                      <div className="mt-2">
                        <span className="font-semibold text-foreground">Returns:</span>
                      </div>
                      <div className="ml-4 text-muted-foreground">Number - The sum of all item prices</div>
                    </div>
                  </div>
                  <div className="border-t border-border pt-4">
                    <h3 className="font-semibold text-foreground mb-2">applyDiscount(total, percent)</h3>
                    <p className="text-muted-foreground text-sm">
                      Applies a percentage-based discount to the provided total amount.
                    </p>
                    <div className="mt-3 space-y-2 text-sm">
                      <div>
                        <span className="font-semibold text-foreground">Parameters:</span>
                      </div>
                      <div className="ml-4 text-muted-foreground">
                        <span className="text-primary">total</span> - The original total amount
                      </div>
                      <div className="ml-4 text-muted-foreground">
                        <span className="text-primary">percent</span> - Discount percentage (0-100)
                      </div>
                      <div className="mt-2">
                        <span className="font-semibold text-foreground">Returns:</span>
                      </div>
                      <div className="ml-4 text-muted-foreground">Number - The discounted total</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}
