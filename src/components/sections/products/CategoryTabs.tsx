import { cn } from "@/lib/utils";

export function CategoryTabs() {
  return (
    <section className="flex flex-wrap justify-center gap-4">
      <TabButton active>Nhân Sâm Củ</TabButton>
      <TabButton>Hồng Sâm</TabButton>
      <TabButton>Cao Sâm</TabButton>
      <TabButton>Nước Sâm</TabButton>
      <TabButton>Viên Uống</TabButton>
      <TabButton>Quà Biếu</TabButton>
    </section>
  );
}

function TabButton({ children, active = false }: { children: React.ReactNode; active?: boolean }) {
  return (
    <button className={cn(
      "px-8 py-3 font-bold text-[12px] tracking-widest uppercase transition-all rounded-lg",
      active 
        ? "bg-primary text-on-primary shadow-lg shadow-primary/20" 
        : "bg-transparent text-secondary border border-outline-variant hover:border-secondary"
    )}>
      {children}
    </button>
  );
}
