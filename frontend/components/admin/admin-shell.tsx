import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type NavItem = {
  label: string;
  href: string;
};

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/admin/documents" },
  { label: "Data Dokumen", href: "/admin/data-dokumen" },
  { label: "Pengaturan Lab", href: "/admin/institution" },
  { label: "Profil", href: "/admin/profile" },
];

export function AdminShell({
  title,
  description,
  children,
  actions,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  const pathname = usePathname();

  const handleLogout = () => {
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem("token");
    }
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/50 to-background">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:flex flex-col border-r border-border bg-card/60 backdrop-blur">
          <div className="px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-lg border border-border bg-card/80 overflow-hidden">
                <Image
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Logo_Kementerian_Pertanian_Republik_Indonesia.svg/2048px-Logo_Kementerian_Pertanian_Republik_Indonesia.svg.png"
                  alt="Kementan Logo"
                  width={40}
                  height={40}
                  className="h-10 w-10 object-contain"
                  unoptimized
                />
              </div>
              <div>
                <p className="text-sm font-semibold leading-none">
                  Kementan - Pelacakan Hasil Lab
                </p>
                <p className="text-xs text-muted-foreground leading-none">
                  Dashboard admin multi-lab
                </p>
              </div>
            </div>
            <ThemeToggle />
          </div>
          <nav className="flex-1 px-3 py-2 space-y-1">
            {navItems.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                  )}
                >
                  {item.label}
                </Link>
                );
              })}
          </nav>
          <div className="px-3 pb-4">
            <button
              onClick={handleLogout}
              className="w-full rounded-lg px-3 py-2 text-sm font-medium text-left bg-muted/60 hover:bg-muted transition"
            >
              Logout
            </button>
          </div>
          <div className="px-6 py-4 text-xs text-muted-foreground">
            © {new Date().getFullYear()} Kementan - Pelacakan Hasil Lab
          </div>
        </aside>

        <main className="flex flex-col">
          <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/70 backdrop-blur">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-primary/80">
                Admin
              </p>
              <h1 className="text-xl font-bold">{title}</h1>
              {description ? (
                <p className="text-sm text-muted-foreground">{description}</p>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              {actions}
              <button
                onClick={handleLogout}
                className="text-xs text-muted-foreground hover:text-foreground underline"
              >
                Logout
              </button>
            </div>
          </header>

          <div className="flex-1 px-6 py-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
