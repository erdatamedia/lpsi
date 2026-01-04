import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

const apiBase = process.env.NEXT_PUBLIC_API_BASE || "https://api.kementan.brmprb.site";

export default function HomePage() {
  return (
    <div className="min-h-screen grid grid-rows-[auto_1fr_auto]">
      <header className="flex items-center justify-between px-6 h-14 border-b bg-background/80 backdrop-blur">
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
              Kementan - Layanan Pelacakan Hasil Lab
            </p>
            <p className="text-xs text-muted-foreground leading-none">
              Multi-lab tracking hasil uji
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild variant="secondary" size="sm">
            <Link href="/login">Login Admin</Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="grid gap-8 lg:grid-cols-2 items-center">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-primary/80">
              Pelacakan Dokumen
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold leading-tight">
              Lacak status hasil laboratorium dengan cepat, satu halaman terpadu.
            </h1>
            <p className="text-base text-muted-foreground max-w-2xl">
              Antarmuka ringan dan responsif, tema glass ringan dengan toggle dark mode.
            </p>
          </div>

          <div className="grid gap-4">
            <InfoCard
              title="Tracking Real-time"
              desc="Cari berdasarkan kode sampel/permohonan, tampilkan status dan riwayat."
            />
            <InfoCard
              title="Multi Instansi"
              desc="Slug instansi dan judul tracking mengikuti konfigurasi backend."
            />
            <InfoCard
              title="Mode Terang/Gelap"
              desc="Toggle tema untuk kenyamanan di segala kondisi."
            />
          </div>
        </div>
      </main>

      <footer className="px-6 py-4 border-t text-xs text-muted-foreground">
        © {new Date().getFullYear()} Kementan - Layanan Pelacakan Hasil Lab
      </footer>
    </div>
  );
}

function InfoCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="glass-card rounded-xl p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{title}</h3>
        <span className="text-xs text-muted-foreground">→</span>
      </div>
      <p className="text-sm text-muted-foreground mt-2">{desc}</p>
    </div>
  );
}
