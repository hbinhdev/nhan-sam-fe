type TestimonialsProps = {
  title?: string | null;
  subtitle?: string | null;
  data?: Record<string, unknown> | null;
};

export function Testimonials({ title, subtitle, data }: TestimonialsProps) {
  const items = Array.isArray(data?.items)
    ? data.items.filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"))
    : [];

  return (
    <section className="w-full py-24 bg-surface-container-low" id="testimonials">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="text-center flex flex-col gap-3 mb-16">
          {subtitle ? <span className="font-bold text-[12px] tracking-[0.15em] uppercase text-secondary">{subtitle}</span> : null}
          {title ? <h2 className="text-3xl md:text-4xl font-serif text-primary">{title}</h2> : null}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {items.map((item, idx) => (
            <TestimonialCard
              key={idx}
              name={typeof item.name === "string" ? item.name : ""}
              loc={typeof item.loc === "string" ? item.loc : ""}
              quote={typeof item.quote === "string" ? item.quote : ""}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ name, loc, quote }: { name: string; loc: string; quote: string }) {
  return (
    <div className="flex flex-col bg-white p-10 border border-outline-variant relative rounded-2xl shadow-sm">
      <div className="flex flex-row text-secondary mb-6 gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i} className="material-symbols-outlined text-sm fill-1">star</span>
        ))}
      </div>
      <p className="text-base italic text-on-surface mb-8 leading-relaxed">"{quote}"</p>
      <div className="flex flex-col">
        <h3 className="font-bold text-primary text-base">{name}</h3>
        <p className="text-xs text-on-surface-variant uppercase tracking-widest">{loc}</p>
      </div>
      <span className="absolute top-8 right-8 material-symbols-outlined text-6xl text-secondary/5 select-none">format_quote</span>
    </div>
  );
}
