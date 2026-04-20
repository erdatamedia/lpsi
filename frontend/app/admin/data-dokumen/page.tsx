"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { ApiResponse, PaginatedDocuments, DocumentItem } from "@/lib/types";
import { AdminShell } from "@/components/admin/admin-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { useRequireAuth } from "@/lib/use-auth";
import { useRouter } from "next/navigation";

type ListResponse = ApiResponse<PaginatedDocuments>;

export default function DataDokumenPage() {
  const { loading: authLoading } = useRequireAuth();
  const router = useRouter();
  const [items, setItems] = useState<DocumentItem[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [status, setStatus] = useState("");
  const [kodeFilter, setKodeFilter] = useState("");
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!kodeFilter.trim()) return items;
    return items.filter((d) => d.kode.toLowerCase().includes(kodeFilter.toLowerCase()));
  }, [items, kodeFilter]);

  const load = async (pageNum: number) => {
    setLoading(true);
    const qs = new URLSearchParams({
      page: String(pageNum),
      pageSize: String(pageSize),
      ...(status ? { status } : {}),
    }).toString();

    const res = await api.get<ListResponse["data"]>(`/admin/documents?${qs}`, true);
    if (!res.status) {
      setError(res.message || "Gagal memuat data dokumen");
    } else {
      setItems(res.data?.items ?? []);
      setTotal(res.data?.total ?? 0);
      setPage(res.data?.page ?? pageNum);
      setError(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (authLoading) return;
    void load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, authLoading]);

  return (
    <AdminShell
      title="Data Dokumen"
      description="Kelola semua dokumen dan status hasil uji"
      actions={
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => void load(page)} disabled={loading}>
            {loading ? "Memuat..." : "Refresh"}
          </Button>
          <Button size="sm" onClick={() => router.push("/admin/documents/new")}>
            Buat Dokumen Baru
          </Button>
        </div>
      }
    >
      <Card className="glass-card mb-4">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <CardTitle>Filter Data</CardTitle>
            <p className="text-sm text-muted-foreground">Cari berdasarkan kode dan status.</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Input
              placeholder="Cari kode"
              className="w-44"
              value={kodeFilter}
              onChange={(e) => setKodeFilter(e.target.value)}
            />
            <Select
              value={status}
              onValueChange={(val) => setStatus(val)}
              className="w-44"
              placeholder="Status (opsional)"
            >
              <option value="">Semua status</option>
              <option value="dibuat">dibuat</option>
              <option value="proses">proses</option>
              <option value="proses-pengujian">proses-pengujian</option>
              <option value="selesai">selesai</option>
              <option value="ditolak">ditolak</option>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {error ? <p className="text-sm text-red-500">{error}</p> : null}
          <div className="overflow-auto border border-border rounded-lg">
            <table className="min-w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-3 py-2">Kode</th>
                  <th className="text-left px-3 py-2">Status</th>
                  <th className="text-left px-3 py-2">Durasi</th>
                  <th className="text-left px-3 py-2">User</th>
                  <th className="text-left px-3 py-2">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((d) => (
                  <tr key={d.id} className="border-t border-border">
                    <td className="px-3 py-2 font-medium">{d.kode}</td>
                    <td className="px-3 py-2">{d.status}</td>
                    <td className="px-3 py-2">{d.durasi} hari</td>
                    <td className="px-3 py-2">{d.user.name}</td>
                    <td className="px-3 py-2">
                      <Link href={`/admin/documents/${d.id}`} className="text-primary">
                        Detail
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Total {total} • Halaman {page}
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={page <= 1 || loading}
                onClick={() => void load(page - 1)}
              >
                Prev
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={page * pageSize >= total || loading}
                onClick={() => void load(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </AdminShell>
  );
}
