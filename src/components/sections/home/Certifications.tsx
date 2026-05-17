import Image from "next/image";

type CertificationsProps = {
  title?: string | null;
  subtitle?: string | null;
  content?: string | null;
  data?: Record<string, unknown> | null;
};

function getItems(data?: Record<string, unknown> | null) {
  const raw = data?.items;
  if (!Array.isArray(raw)) return [];
  return raw.filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"));
}

export function Certifications({ title, subtitle, content, data }: CertificationsProps) {
  const items = getItems(data);
  const images = Array.isArray(data?.images) ? data?.images : [];

  return (
    <section className="w-full py-24 bg-surface-container-low" id="certifications">
      <div className="max-w-[1280px] mx-auto px-6 flex flex-col md:flex-row gap-16 items-center">
        <div className="w-full md:w-1/2 flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            {subtitle ? <span className="font-bold text-[12px] tracking-[0.15em] uppercase text-secondary">{subtitle}</span> : null}
            {title ? <h2 className="text-3xl md:text-4xl font-serif text-primary leading-[1.2] text-balance tracking-tight">{title}</h2> : null}
          </div>
          {content ? <p className="text-base text-on-surface-variant leading-relaxed">{content}</p> : null}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
            {items.map((item, idx) => (
              <div className="flex flex-row items-center gap-4" key={idx}>
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-secondary/10 text-secondary">
                  <span className="material-symbols-outlined text-[32px]">{typeof item.icon === "string" ? item.icon : "verified"}</span>
                </div>
                <div className="flex flex-col">
                  <h3 className="font-bold text-on-surface text-base">{typeof item.title === "string" ? item.title : ""}</h3>
                  <p className="text-sm text-on-surface-variant">{typeof item.desc === "string" ? item.desc : ""}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full md:w-1/2 grid grid-cols-2 gap-4">
          {[0, 1].map((i) => {
            const url = typeof images?.[i] === "string" ? images[i] : "/images/certification.png";
            return (
              <div key={i} className={`relative aspect-[3/4] border border-outline-variant p-2 bg-white shadow-sm overflow-hidden group ${i === 1 ? "mt-8" : ""}`}>
                <Image alt={`Certification ${i + 1}`} src={url} fill className="object-cover p-2 group-hover:scale-105 transition-transform duration-500" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
