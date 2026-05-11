import { CheckoutForm } from "@/components/sections/checkout/CheckoutForm";
import { CheckoutSummary } from "@/components/sections/checkout/CheckoutSummary";

export default function CheckoutPage() {
  return (
    <main className="min-h-screen max-w-screen-2xl mx-auto px-12 py-16 relative">
      <div className="absolute inset-0 bg-pattern pointer-events-none" />
      
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-16">
        <CheckoutForm />
        <CheckoutSummary />
      </div>

      {/* Authenticity Badge */}
      <div className="fixed bottom-8 right-8 z-40 hidden lg:block">
        <div className="bg-white/80 backdrop-blur-md border border-secondary p-4 flex items-center gap-4 shadow-2xl rounded-xl">
          <div className="w-12 h-12 rounded-full border-2 border-secondary flex items-center justify-center">
            <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
              workspace_premium
            </span>
          </div>
          <div>
            <p className="text-label-caps text-[9px] text-on-surface-variant leading-none">CERTIFICATE OF</p>
            <p className="text-headline-sm text-xs text-primary">Authenticity</p>
          </div>
        </div>
      </div>
    </main>
  );
}
