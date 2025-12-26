import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, CirclePlay } from "lucide-react";
import { BackgroundPattern } from "@/components/background-pattern";
import Link from "next/link";

export default function Hero() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 border-b-0 bg-background relative overflow-hidden" style={{ borderBottom: '1px solid transparent' }}>
      {/* Dot pattern only inside hero */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <BackgroundPattern />
      </div>

      <div className="relative z-10 text-center max-w-3xl">
        <Badge
          variant="secondary"
          className="rounded-full py-1 border-border"
          asChild
        >
          <Link href="#launches">
            Fair Launches on Stacks <ArrowUpRight className="ml-1 size-4" />
          </Link>
        </Badge>
        <h1 className="mt-6 text-4xl sm:text-5xl md:text-6xl lg:text-7xl md:leading-[1.2] font-semibold tracking-tighter">
          Launch Your Memecoin on Stacks
        </h1>
        <p className="mt-6 md:text-lg text-foreground/80">
          Memestack lets you create and join fair, transparent token launches with built-in refund protection. No presale, no VCs—just community-first launches for everyone.
        </p>
        <div className="mt-12 flex items-center justify-center gap-4">
          <Button size="lg" className="rounded-full text-base">
            Get Started <ArrowUpRight className="h-5! w-5!" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="rounded-full text-base shadow-none"
            asChild
          >
            <Link href="#how-it-works">
              <CirclePlay className="h-5! w-5!" /> Learn How It Works
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
