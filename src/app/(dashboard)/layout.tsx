import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r bg-muted/30 p-6 flex flex-col">
        <div className="font-bold text-xl mb-8">Admin Panel</div>
        <nav className="flex-1 space-y-2">
          <Link href="/dashboard" className="block px-4 py-2 rounded-md hover:bg-accent">Overview</Link>
          <Link href="#" className="block px-4 py-2 rounded-md hover:bg-accent">Settings</Link>
        </nav>
        <Link
          href="/"
          className={cn(buttonVariants({ variant: "outline" }), "mt-auto")}
        >
          Back to Site
        </Link>
      </aside>
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
