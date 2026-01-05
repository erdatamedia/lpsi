"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import type { ApiResponse, Institution } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";

type TrackingData = {
  id: number;
  kode: string;
  status: string;
  durasi: number;
  created_at: string;
  historis?: {
    id: number;
    waktu: string;
    status: string;
    note?: string | null;
    attachmentUrl?: string | null;
  }[];
};

export default function PublicTrackingPage() {
  const params = useParams<{ slug: string }>();
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [kode, setKode] = useState("");
  const [result, setResult] = useState<TrackingData | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadInst = async () => {
      const res = await api.get<ApiResponse<Institution>["data"]>(
        `/institutions/${params.slug}`,
      );
      if (res.status) {
        setInstitution(res.data ?? null);
      } else {
        setMessage("Instansi tidak ditemukan");
      }
    };
    void loadInst();
  }, [params.slug]);

  const search = async () => {
    if (!kode.trim()) {
      setMessage("Kode wajib diisi");
      setResult(null);
      return;
    }
    setLoading(true);
    setMessage(null);
    setResult(null);
    const res = await api.get<ApiResponse<TrackingData>["data"]>(
      `/tracking?kode=${kode.trim()}`,
    );
    setLoading(false);
    if (!res.status) {
      setMessage(res.message || "Data tidak ditemukan");
      return;
    }
    setResult(res.data ?? null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/60 to-background flex flex-col">
      <div className="container mx-auto px-6 py-10 space-y-8 flex-1">
        <header className="flex flex-col items-center text-center gap-3">
          {institution?.logoUrl ? (
            <Image
              src={institution.logoUrl}
              alt={`${institution.name} logo`}
              width={120}
              height={120}
              className="h-28 w-28 object-contain rounded-xl border border-border bg-card/80 shadow-card"
              unoptimized
            />
          ) : null}
          <p className="text-xs uppercase tracking-[0.3em] text-primary/80">
            {institution?.slug || "Lab"}
          </p>
          <h1 className="text-3xl font-bold">
            {institution?.trackingTitle || "Pelacakan Hasil Laboratorium"}
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Masukkan kode sampel/permohonan untuk melihat status dan riwayat progres.
          </p>
          <ThemeToggle />
        </header>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-center w-full">Masukkan kode</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2 flex-wrap justify-center">
              <Input
                className="w-64"
                placeholder="contoh: Lab/054/E/2025"
                value={kode}
                onChange={(e) => setKode(e.target.value)}
              />
              <button
                onClick={search}
                disabled={loading}
                className="h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
              >
                {loading ? "Mencari..." : "Cari"}
              </button>
            </div>
            {message ? <p className="text-sm text-muted-foreground text-center">{message}</p> : null}
            {result ? <ResultCard data={result} /> : null}
          </CardContent>
        </Card>
      </div>
      <footer className="px-6 py-4 text-center text-xs text-muted-foreground border-t">
        © {new Date().getFullYear()} Kementan - Layanan Pelacakan Hasil Lab
      </footer>
    </div>
  );
}

function ResultCard({ data }: { data: TrackingData }) {
  const historis = [...(data.historis || [])].sort(
    (a, b) => new Date(a.waktu).getTime() - new Date(b.waktu).getTime(),
  );

  const timeline = [...historis];
  const last = timeline[timeline.length - 1];
  const docTimestamp = data.created_at ? new Date(data.created_at).toISOString() : new Date().toISOString();
  const statusSteps = ["dibuat", "proses", "proses-pengujian", "selesai"];
  const statusIndex = Math.max(0, statusSteps.indexOf(data.status));
  const latestAttachment = [...historis]
    .filter((item) => item.attachmentUrl)
    .pop();

  // Tambahkan status dokumen terkini jika belum ada di historis
  if (!last || last.status !== data.status) {
    timeline.push({
      id: Number.MAX_SAFE_INTEGER,
      status: data.status,
      waktu: docTimestamp,
    });
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-muted/30 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Status Saat Ini
            </p>
            <p className="text-lg font-semibold">{data.status}</p>
          </div>
          {data.status === "selesai" ? (
            latestAttachment?.attachmentUrl ? (
              <a
                href={`${api.baseUrl}${latestAttachment.attachmentUrl}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
              >
                Unduh PDF Hasil
              </a>
            ) : (
              <span className="text-xs text-muted-foreground">
                PDF hasil belum tersedia.
              </span>
            )
          ) : (
            <span className="text-xs text-muted-foreground">
              Dokumen masih diproses.
            </span>
          )}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {statusSteps.map((step, idx) => {
            const active = idx === statusIndex;
            const done = idx < statusIndex;
            return (
              <div
                key={step}
                className={`rounded-full border px-3 py-2 text-center text-xs font-medium ${
                  active
                    ? "border-primary bg-primary/15 text-primary"
                    : done
                      ? "border-primary/50 bg-primary/10 text-primary/80"
                      : "border-border bg-background"
                }`}
              >
                {step}
              </div>
            );
          })}
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-3 text-sm">
        <Info label="Kode" value={data.kode} />
        <Info label="Status" value={data.status} />
        <Info label="Durasi" value={`${data.durasi} hari`} />
        <Info
          label="Dibuat"
          value={data.created_at ? new Date(data.created_at).toLocaleString() : "-"}
        />
      </div>
      {timeline.length ? (
        <div>
          <h4 className="text-center font-semibold text-sm mb-4">Riwayat</h4>
          <div className="relative pl-6">
            <div className="absolute left-2 top-0 bottom-0 w-px bg-primary/30" />
            {timeline.map((h, idx) => {
              const isLast = idx === timeline.length - 1;
              return (
                <div key={h.id} className="relative pb-4">
                  {!isLast && (
                    <span className="absolute left-2 top-4 h-full w-px bg-primary/40" />
                  )}
                  <span className="absolute left-[-2px] top-1 h-3 w-3 rounded-full bg-primary animate-pulse" />
                  <div className="rounded-md border border-border bg-muted/40 px-3 py-2 shadow-sm">
                    <p className="text-sm font-medium">
                      {h.status}
                      {h.note ? (
                        <span className="text-xs text-muted-foreground"> — {h.note}</span>
                      ) : null}
                    </p>
                    {h.attachmentUrl ? (
                      <a
                        href={`${api.baseUrl}${h.attachmentUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 block text-xs text-primary underline"
                      >
                        Unduh PDF hasil
                      </a>
                    ) : null}
                    <p className="text-xs text-muted-foreground">
                      {new Date(h.waktu).toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <p className="text-center text-sm text-muted-foreground">Belum ada riwayat.</p>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-lg border border-border bg-muted/40">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground">{value || "-"}</p>
    </div>
  );
}
