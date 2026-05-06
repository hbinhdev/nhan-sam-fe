import { ContactHero } from "@/components/sections/contact/ContactHero";
import { ContactBento } from "@/components/sections/contact/ContactBento";
import { MapSection, PurityBanner } from "@/components/sections/contact/ContactFooterSections";

export default function ContactPage() {
  return (
    <main className="flex flex-col">
      <ContactHero />
      <ContactBento />
      <MapSection />
      <PurityBanner />
    </main>
  );
}
