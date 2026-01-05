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
  const { loading: authLoading, profile } = useRequireAuth();
  const router = useRouter();
  const [items, setItems] = useState<DocumentItem[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [status, setStatus] = useState("");
  const [kodeFilter, setKodeFilter] = useState("");
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<DocumentItem | null>(null);
  const [editKode, setEditKode] = useState("");
  const [editDurasi, setEditDurasi] = useState(1);
  const [editStatus, setEditStatus] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const statusOptions = useMemo(
    () => ["dibuat", "proses", "proses-pengujian", "selesai", "ditolak"],
    [],
  );

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

  const startEdit = (doc: DocumentItem) => {
    setEditItem(doc);
    setEditKode(doc.kode);
    setEditDurasi(doc.durasi);
    setEditStatus(doc.status);
    setError(null);
  };

  const cancelEdit = () => {
    setEditItem(null);
    setEditKode("");
    setEditDurasi(1);
    setEditStatus("");
  };

  const saveEdit = async () => {
    if (!editItem) return;
    if (!editKode.trim() || !editStatus.trim()) {
      setError("Kode dan status wajib diisi");
      return;
    }
    setEditLoading(true);
    const res = await api.patch<ApiResponse<DocumentItem>["data"]>(
      `/admin/documents/${editItem.id}`,
      { kode: editKode.trim(), durasi: Number(editDurasi), status: editStatus },
      true,
    );
    setEditLoading(false);
    if (!res.status) {
      setError(res.message || "Gagal memperbarui dokumen");
      return;
    }
    cancelEdit();
    void load(page);
  };

  const removeDoc = async (docId: number) => {
    if (!window.confirm("Hapus dokumen ini? Tindakan ini tidak bisa dibatalkan.")) {
      return;
    }
    setDeleteId(docId);
    const res = await api.delete<ApiResponse<null>["data"]>(
      `/admin/documents/${docId}`,
      true,
    );
    setDeleteId(null);
    if (!res.status) {
      setError(res.message || "Gagal menghapus dokumen");
      return;
    }
    void load(page);
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
      role={profile?.user.role}
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
          {editItem ? (
            <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Edit Dokumen</p>
                <button
                  className="text-xs text-muted-foreground underline"
                  onClick={cancelEdit}
                >
                  Batal
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Input
                  placeholder="Kode"
                  className="w-52"
                  value={editKode}
                  onChange={(e) => setEditKode(e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Durasi"
                  className="w-32"
                  value={editDurasi}
                  onChange={(e) => setEditDurasi(Number(e.target.value))}
                />
                <Select
                  value={editStatus}
                  onValueChange={(val) => setEditStatus(val)}
                  className="w-44"
                  placeholder="Status"
                >
                  {statusOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </Select>
                <Button size="sm" onClick={saveEdit} disabled={editLoading}>
                  {editLoading ? "Menyimpan..." : "Simpan"}
                </Button>
              </div>
            </div>
          ) : null}
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
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/documents/${d.id}`} className="text-primary">
                          Detail
                        </Link>
                        <button
                          className="text-xs text-muted-foreground underline"
                          onClick={() => startEdit(d)}
                        >
                          Edit
                        </button>
                        <button
                          className="text-xs text-red-500 underline"
                          onClick={() => void removeDoc(d.id)}
                          disabled={deleteId === d.id}
                        >
                          {deleteId === d.id ? "Menghapus..." : "Hapus"}
                        </button>
                      </div>
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
