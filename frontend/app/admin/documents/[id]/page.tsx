"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { ApiResponse, DocumentDetail, DocumentHistoris } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminShell } from "@/components/admin/admin-shell";
import { useRequireAuth } from "@/lib/use-auth";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type DetailResponse = ApiResponse<DocumentDetail>;

export default function DocumentDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { loading: authLoading } = useRequireAuth();
  const [data, setData] = useState<DocumentDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [histStatus, setHistStatus] = useState("");
  const [note, setNote] = useState("");
  const [histLoading, setHistLoading] = useState(false);
  const statusOptions = useMemo(
    () => ["dibuat", "proses", "proses-pengujian", "selesai", "ditolak"],
    [],
  );

  const load = async () => {
    setLoading(true);
    const res = await api.get<DetailResponse["data"]>(
      `/admin/documents/${params.id}`,
      true,
    );
    if (!res.status) {
      setError(res.message || "Gagal memuat dokumen");
    } else {
      setData(res.data ?? null);
      setError(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (authLoading) return;
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id, authLoading]);

  const addHistoris = async () => {
    if (!histStatus.trim()) return;
    setHistLoading(true);
    const res = await api.post<ApiResponse<DocumentHistoris>["data"]>(
      `/admin/documents/${params.id}/historis`,
      { status: histStatus, note },
      true,
    );
    setHistLoading(false);
    if (!res.status) {
      setError(res.message || "Gagal menambah historis");
      return;
    }
    setHistStatus("");
    setNote("");
    void load();
  };

  return (
    <AdminShell
      title="Detail Hasil Lab"
      description="Pelacakan status dan riwayat"
      actions={
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            ← Kembali
          </Button>
          <Button variant="secondary" size="sm" onClick={() => void load()}>
            Refresh
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Info Dokumen</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
            {loading ? <p>Memuat...</p> : null}
            {error ? <p className="text-red-500">{error}</p> : null}
            {data ? (
              <>
                <Info label="Kode" value={data.kode} />
                <Info label="Status" value={data.status} />
                <Info label="Durasi" value={`${data.durasi} hari`} />
                <Info
                  label="Dibuat"
                  value={
                    data.created_at
                      ? new Date(data.created_at).toLocaleString()
                      : "-"
                  }
                />
                <Info label="User" value={data.user.name} />
                <Info label="Instansi" value={data.institution?.name ?? "-"} />
              </>
            ) : null}
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Riwayat</CardTitle>
              <p className="text-sm text-muted-foreground">
                Tambah status baru ke historis dokumen.
              </p>
            </div>
            <div className="flex gap-2 flex-wrap items-center">
              <Select value={histStatus} onValueChange={(val) => setHistStatus(val)}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Catatan (opsional)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-64"
              />
              <Button onClick={addHistoris} disabled={histLoading}>
                {histLoading ? "Menyimpan..." : "Tambah"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
              <div className="relative pl-6">
                <div className="absolute left-2 top-0 bottom-0 w-px bg-primary/30" />
                {data?.historis?.map((h, idx) => (
                  <div key={h.id} className="relative pb-4">
                    <span className="absolute left-[-2px] top-1 h-3 w-3 rounded-full bg-primary" />
                    <div className="rounded-md border border-border bg-muted/40 px-3 py-2">
                      <p className="text-sm font-medium">
                        {h.status}
                        {h.note ? (
                          <span className="text-xs text-muted-foreground"> — {h.note}</span>
                        ) : null}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(h.waktu).toLocaleString()}
                      </p>
                    </div>
                    {idx === (data?.historis?.length ?? 1) - 1 ? null : null}
                  </div>
                ))}
              </div>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
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
