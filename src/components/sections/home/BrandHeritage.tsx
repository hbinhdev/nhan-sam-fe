import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type BrandHeritageProps = {
  title?: string | null;
  subtitle?: string | null;
  content?: string | null;
  imageUrl?: string | null;
  ctaText?: string | null;
  ctaLink?: string | null;
  data?: Record<string, unknown> | null;
};

export function BrandHeritage({
  title,
  subtitle,
  content,
  imageUrl,
  ctaText,
  ctaLink,
  data,
}: BrandHeritageProps) {
  const quote = typeof data?.quote === "string" ? data.quote : null;

  return (
    <section className="w-full py-24 bg-white overflow-hidden" id="heritage">
      <div className="max-w-[1280px] mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-24 items-center">
        <div className="relative order-2 md:order-1">
          <div className="absolute -top-8 -left-8 w-48 h-48 bg-surface-container-low -z-10 rounded-2xl"></div>
          <div className="relative aspect-square md:aspect-auto md:h-[600px] overflow-hidden rounded-2xl grayscale hover:grayscale-0 transition-all duration-1000">
            <Image alt={title || "Brand story"} src={imageUrl || "/images/heritage.png"} fill className="object-cover" />
          </div>
          {quote ? (
            <div className="absolute -bottom-8 -right-8 bg-primary-container text-on-primary p-10 hidden lg:block shadow-2xl rounded-lg">
              <p className="font-serif italic text-2xl leading-tight">"{quote}"</p>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-8 order-1 md:order-2">
          <div className="flex flex-col gap-3">
            {subtitle ? <span className="font-bold text-[12px] tracking-[0.15em] uppercase text-secondary">{subtitle}</span> : null}
            {title ? <h2 className="text-3xl md:text-4xl font-serif text-primary leading-[1.2]">{title}</h2> : null}
          </div>
          {content ? <p className="text-lg text-on-surface-variant leading-relaxed">{content}</p> : null}
          {ctaText ? (
            <Link
              href={ctaLink || "#"}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "border-primary text-primary h-12 px-8 rounded-lg text-xs font-bold tracking-widest uppercase flex items-center self-start",
              )}
            >
              {ctaText}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
