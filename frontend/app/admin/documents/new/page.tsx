"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import type { ApiResponse, DocumentItem } from "@/lib/types";
import { useRequireAuth } from "@/lib/use-auth";

export default function CreateDocumentPage() {
  const { loading: authLoading } = useRequireAuth();
  const router = useRouter();
  const [kode, setKode] = useState("");
  const [durasi, setDurasi] = useState(7);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setLoading(true);
    setError(null);
    const res = await api.post<ApiResponse<DocumentItem>["data"]>(
      "/admin/documents",
      { kode, durasi: Number(durasi), status: "proses" },
      true,
    );
    setLoading(false);
    if (!res.status) {
      setError(res.message || "Gagal membuat dokumen");
      return;
    }
    router.push("/admin/data-dokumen");
  };

  return (
    <AdminShell title="Buat Dokumen Baru" description="Tambahkan dokumen hasil uji">
      <Card className="glass-card max-w-xl">
        <CardHeader>
          <CardTitle>Form Dokumen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Input
              placeholder="Kode (contoh: LAB/001/2025)"
              value={kode}
              onChange={(e) => setKode(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Gunakan kode unik permohonan/hasil uji.
            </p>
          </div>
          <Input
            type="number"
            placeholder="Durasi (hari, contoh: 7)"
            value={durasi}
            onChange={(e) => setDurasi(Number(e.target.value))}
          />
          <p className="text-xs text-muted-foreground">
            Durasi estimasi proses dalam hari.
          </p>
          {error ? <p className="text-sm text-red-500">{error}</p> : null}
          <div className="flex gap-2">
            <Button onClick={submit} disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan"}
            </Button>
            <Button variant="outline" onClick={() => router.back()}>
              Batal
            </Button>
          </div>
        </CardContent>
      </Card>
    </AdminShell>
  );
}
