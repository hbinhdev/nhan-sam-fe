import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type HeroProps = {
  title?: string | null;
  subtitle?: string | null;
  content?: string | null;
  imageUrl?: string | null;
  ctaText?: string | null;
  ctaLink?: string | null;
  data?: Record<string, unknown> | null;
};

export function Hero({
  title,
  subtitle,
  content,
  imageUrl,
  ctaText,
  ctaLink,
  data,
}: HeroProps) {
  const secondaryCtaText = typeof data?.secondaryCtaText === "string" ? data.secondaryCtaText : null;
  const secondaryCtaLink = typeof data?.secondaryCtaLink === "string" ? data.secondaryCtaLink : "#";

  return (
    <section className="relative flex min-h-[560px] w-full items-center overflow-hidden bg-surface md:min-h-[600px] md:h-[calc(100vh-80px)]" id="hero-banner">
      <div className="absolute inset-0 z-0">
        <Image
          alt={title || "Home Hero"}
          className="w-full h-full object-cover"
          src={imageUrl || "/images/hero.png"}
          fill
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-surface/90 via-surface/40 to-transparent"></div>
      </div>

      <div className="relative z-10 w-full max-w-[1280px] mx-auto px-6">
        <div className="max-w-[640px] flex flex-col gap-6">
          {subtitle ? <span className="font-semibold text-sm tracking-wider text-secondary">{subtitle}</span> : null}
          {title ? <h1 className="text-5xl md:text-6xl font-serif text-primary leading-[1.1] tracking-tight text-balance">{title}</h1> : null}
          {content ? <p className="text-lg text-on-surface-variant leading-relaxed max-w-[500px]">{content}</p> : null}

          <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:gap-4">
            {ctaText ? (
              <Link
                href={ctaLink || "#"}
                className={cn(
                  buttonVariants({ variant: "default" }),
                  "h-14 px-10 rounded-lg text-base font-semibold tracking-wide flex items-center bg-primary text-on-primary",
                )}
              >
                {ctaText}
              </Link>
            ) : null}

            {secondaryCtaText ? (
              <Link
                href={secondaryCtaLink}
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "border-secondary text-secondary h-14 px-10 rounded-lg text-base font-semibold tracking-wide flex items-center hover:bg-secondary/5",
                )}
              >
                {secondaryCtaText}
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
