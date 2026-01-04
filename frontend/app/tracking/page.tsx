"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const apiBase = process.env.NEXT_PUBLIC_API_BASE || "https://api.kementan.brmprb.site";

type TrackingResponse = {
  id: number;
  kode: string;
  status: string;
  durasi: number;
  created_at: string;
  user?: { id: number; name: string; email: string };
  historis?: { id: number; waktu: string; status: string }[];
  institution?: { id: number; name: string; slug: string; trackingTitle: string };
};

export default function TrackingPage() {
  const [kode, setKode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrackingResponse | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch(`${apiBase}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        const json = await res.json();
        if (res.ok && json?.status) setProfile(json.data);
      })
      .catch(() => null);
  }, []);

  const search = async () => {
    if (!kode.trim()) {
      setMessage("Kode wajib diisi");
      setResult(null);
      return;
    }
    setLoading(true);
    setMessage(null);
    setResult(null);
    try {
      const res = await fetch(`${apiBase}/tracking?kode=${kode.trim()}`);
      const json = await res.json();
      if (!json?.status) {
        setMessage(json?.message || "Data tidak ditemukan");
        return;
      }
      setResult(json.data as TrackingResponse);
    } catch {
      setMessage("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/60 to-background">
      <div className="container mx-auto px-6 py-10 space-y-8">
        <div className="flex items-center justify-between">
          <div>
          <p className="text-xs uppercase tracking-[0.3em] text-primary/80">
            Pelacakan Hasil Lab
          </p>
          <h1 className="text-2xl font-bold mt-1">
            Cari status hasil uji dengan kode unik
          </h1>
          <p className="text-sm text-muted-foreground">
            Kartu rounded, glass effect, dan dukungan mode gelap.
          </p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
            ← Kembali
          </Button>
        </div>

        <Card className="glass-card">
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <CardTitle>Masukkan kode hasil uji</CardTitle>
              <p className="text-sm text-muted-foreground">
                Contoh: ABC123 atau kode tracking dari backend.
              </p>
            </div>
            <div className="flex gap-2">
              <Input
                className="w-48 sm:w-64"
                placeholder="Kode"
                value={kode}
                onChange={(e) => setKode(e.target.value)}
              />
              <Button onClick={search} disabled={loading}>
                {loading ? "Mencari..." : "Cari"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {message ? (
              <p className="text-sm text-muted-foreground">{message}</p>
            ) : null}
            {result ? <TrackingResult data={result} /> : null}
          </CardContent>
        </Card>

        {profile ? (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Profil (JWT)</CardTitle>
              <p className="text-sm text-muted-foreground">
                Data diambil dari /auth/profile menggunakan token login.
              </p>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-1">
              <div><span className="text-foreground">Nama:</span> {profile.user?.name}</div>
              <div><span className="text-foreground">Email:</span> {profile.user?.email}</div>
              {profile.institution ? (
                <div>
                  <span className="text-foreground">Instansi:</span>{" "}
                  {profile.institution.name} ({profile.institution.slug})
                </div>
              ) : null}
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}

function TrackingResult({ data }: { data: TrackingResponse }) {
  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-3 text-sm">
        <Info label="Kode" value={data.kode} />
        <Info label="Status" value={data.status} />
        <Info label="Durasi" value={`${data.durasi} hari`} />
        <Info
          label="Dibuat"
          value={data.created_at ? new Date(data.created_at).toLocaleString() : "-"}
        />
        <Info label="Instansi" value={data.institution?.name || "-"} />
        <Info label="Judul Tracking" value={data.institution?.trackingTitle || "-"} />
      </div>

      {data.historis?.length ? (
        <div>
          <h4 className="font-semibold text-sm mb-2">Riwayat</h4>
          <div className="space-y-2">
            {data.historis.map((h) => (
              <div
                key={h.id}
                className="flex items-start justify-between rounded-md border border-border bg-muted/50 px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium">{h.status}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(h.waktu).toLocaleString()}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">#{h.id}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Info({ label, value }: { label: string; value?: string }) {
  return (
    <div className="p-3 rounded-lg border border-border bg-muted/40">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground">{value || "-"}</p>
    </div>
  );
}
