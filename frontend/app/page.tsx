import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

const apiBase =
  process.env.NEXT_PUBLIC_API_BASE || "https://api.kementan.brmprb.site";

type Institution = {
  id: number;
  name: string;
  slug: string;
  trackingTitle: string;
  logoUrl: string | null;
  created_at: string | null;
};

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

function buildMonthSeries(institutions: Institution[], count = 6) {
  const now = new Date();
  const months = Array.from({ length: count }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (count - 1 - index), 1);
    const year = date.getFullYear();
    const monthIndex = date.getMonth();
    return {
      key: `${year}-${monthIndex}`,
      label: `${MONTH_LABELS[monthIndex]} ${String(year).slice(-2)}`,
      monthIndex,
      year,
    };
  });

  const counts = new Map<string, number>();
  for (const inst of institutions) {
    if (!inst.created_at) continue;
    const date = new Date(inst.created_at);
    if (Number.isNaN(date.getTime())) continue;
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    counts.set(key, (counts.get(key) || 0) + 1);
  }

  const series = months.map((month) => ({
    label: month.label,
    count: counts.get(month.key) || 0,
  }));
  const maxCount = Math.max(1, ...series.map((item) => item.count));

  return { series, maxCount };
}

async function getInstitutions(): Promise<Institution[]> {
  try {
    const res = await fetch(`${apiBase}/institutions`, {
      next: { revalidate: 120 },
    });
    if (!res.ok) return [];
    const payload = (await res.json()) as { status?: boolean; data?: Institution[] };
    if (!payload?.status || !payload.data) return [];
    return payload.data;
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const institutions = await getInstitutions();
  const totalInstitutions = institutions.length;
  const recentCutoff = new Date();
  recentCutoff.setDate(recentCutoff.getDate() - 30);
  const recentInstitutions = institutions.filter((inst) => {
    if (!inst.created_at) return false;
    const created = new Date(inst.created_at);
    return !Number.isNaN(created.getTime()) && created >= recentCutoff;
  }).length;
  const withLogo = institutions.filter((inst) => inst.logoUrl).length;
  const { series, maxCount } = buildMonthSeries(institutions, 6);

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
              Pelacakan hasil laboratorium terpusat untuk layanan publik dan internal.
            </h1>
            <p className="text-base text-muted-foreground max-w-2xl">
              Antarmuka responsif dengan tampilan glass yang konsisten serta dukungan tema terang
              dan gelap.
            </p>
          </div>

          <div className="grid gap-4">
            <InfoCard
              title="Tracking Status"
              desc="Pencarian berbasis kode sampel atau permohonan dengan status dan riwayat proses."
            />
            <InfoCard
              title="Multi Instansi"
              desc="Slug instansi dan judul tracking mengikuti pengaturan resmi di backend."
            />
            <InfoCard
              title="Tema Terang/Gelap"
              desc="Pilihan tema yang nyaman untuk kebutuhan operasional dan publik."
            />
          </div>
        </div>

        <section className="mt-12 space-y-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-semibold">Instansi Terdaftar</h2>
            <p className="text-sm text-muted-foreground">
              Ringkasan instansi yang telah mendaftar dan tren registrasi terbaru.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold">KPI Instansi</p>
                  <p className="text-xs text-muted-foreground">
                    Pembaruan otomatis dari database registrasi.
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  Total: {totalInstitutions}
                </span>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <KpiCard label="Total Instansi" value={totalInstitutions} />
                <KpiCard label="Registrasi 30 Hari" value={recentInstitutions} />
                <KpiCard label="Memiliki Logo" value={withLogo} />
              </div>

              <div className="mt-6 rounded-xl border border-border/70 bg-background/60 px-4 py-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">Tren 6 Bulan Terakhir</p>
                  <p className="text-xs text-muted-foreground">
                    Jumlah registrasi per bulan
                  </p>
                </div>
                <div className="mt-4 grid grid-cols-6 items-end gap-3">
                  {series.map((item) => {
                    const height = Math.max(
                      12,
                      Math.round((item.count / maxCount) * 100),
                    );
                    return (
                      <div key={item.label} className="flex flex-col items-center gap-2">
                        <div className="h-28 w-full max-w-[44px] rounded-full bg-muted/70 px-1 py-1">
                          <div
                            className="w-full rounded-full bg-gradient-to-t from-primary/90 to-accent/70"
                            style={{ height: `${height}%` }}
                          />
                        </div>
                        <span className="text-[11px] text-muted-foreground">
                          {item.label}
                        </span>
                        <span className="text-xs font-semibold">{item.count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">Daftar Instansi</p>
                  <p className="text-xs text-muted-foreground">
                    Nama instansi dan slug pelacakan.
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  Menampilkan {Math.min(6, totalInstitutions)}
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {institutions.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                    Belum ada instansi terdaftar.
                  </div>
                ) : (
                  institutions.slice(0, 6).map((inst) => (
                    <div
                      key={inst.id}
                      className="rounded-xl border border-border/70 bg-background/70 p-3"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold">{inst.name}</p>
                        <span className="text-xs text-muted-foreground">
                          /{inst.slug}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {inst.trackingTitle}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>
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

function KpiCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border/70 bg-background/70 p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-xl font-semibold mt-1">{value}</p>
    </div>
  );
}
