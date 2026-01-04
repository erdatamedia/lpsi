"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { ApiResponse, PaginatedDocuments, DocumentItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminShell } from "@/components/admin/admin-shell";
import { KpiCard } from "@/components/admin/kpi-card";
import { StatusChart } from "@/components/admin/status-chart";
import { FileText } from "lucide-react";
import { useRequireAuth } from "@/lib/use-auth";
import { Select } from "@/components/ui/select";

type ListResponse = ApiResponse<PaginatedDocuments>;

export default function DocumentsPage() {
  const { loading: authLoading } = useRequireAuth();
  const [items, setItems] = useState<DocumentItem[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(200);
  const [status, setStatus] = useState("");
  const [kodeFilter, setKodeFilter] = useState("");
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [year, setYear] = useState<string | undefined>(undefined);

  const filtered = useMemo(() => {
    let data = items;
    if (year) {
      data = data.filter((d) => d.created_at && new Date(d.created_at).getFullYear().toString() === year);
    }
    if (kodeFilter.trim()) {
      data = data.filter((d) => d.kode.toLowerCase().includes(kodeFilter.toLowerCase()));
    }
    return data;
  }, [items, kodeFilter, year]);

  const kpis = useMemo(() => {
    const data = filtered;
    const totalDocs = data.length;
    const statusMap = data.reduce<Record<string, number>>((acc, d) => {
      const key = d.status.toLowerCase();
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});
    return { totalDocs, statusMap };
  }, [filtered]);

  const chartData = useMemo(() => {
    return Object.entries(kpis.statusMap).map(([label, value]) => ({
      label,
      value,
    }));
  }, [kpis.statusMap]);

  const yearOptions = useMemo(() => {
    const years = new Set<string>();
    items.forEach((d) => {
      if (d.created_at) {
        years.add(new Date(d.created_at).getFullYear().toString());
      }
    });
    return Array.from(years).sort().reverse();
  }, [items]);

  const load = async (pageNum: number) => {
    setLoading(true);
    const qs = new URLSearchParams({
      page: String(pageNum),
      pageSize: String(pageSize),
      ...(status ? { status } : {}),
    }).toString();

    const res = await api.get<ListResponse["data"]>(`/admin/documents?${qs}`, true);
    if (!res.status) {
      setError(res.message || "Gagal memuat dokumen");
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
      title="Dashboard"
      description="Ikhtisar hasil uji per lab"
      actions={
        <Button asChild variant="secondary" size="sm">
          <Link href="/admin/profile">Profil</Link>
        </Button>
      }
    >
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Select
          value={year ?? ""}
          onValueChange={(val) => setYear(val || undefined)}
          className="w-32"
          placeholder="Semua tahun"
        >
          <option value="">Semua tahun</option>
          {yearOptions.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid gap-3 sm:grid-cols-4 mb-4">
        <KpiCard label="Total Dokumen" value={kpis.totalDocs} icon={<FileText className="h-4 w-4" />} />
      </div>

      <div className="mb-4">
        <StatusChart data={chartData} title="Distribusi Status" heightClass="h-64" />
      </div>

      <Card className="glass-card">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <CardTitle>Filter</CardTitle>
            <p className="text-sm text-muted-foreground">
              Cari cepat berdasarkan status/kode.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Input
              placeholder="Cari kode"
              className="w-44"
              value={kodeFilter}
              onChange={(e) => setKodeFilter(e.target.value)}
            />
            <Input
              placeholder="Status (opsional)"
              className="w-44"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            />
            <Button onClick={() => void load(1)} disabled={loading}>
              {loading ? "Memuat..." : "Refresh"}
            </Button>
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
