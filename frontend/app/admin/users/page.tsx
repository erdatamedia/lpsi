"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import type { AdminUser, ApiResponse, Institution } from "@/lib/types";
import { AdminShell } from "@/components/admin/admin-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { useRequireAuth } from "@/lib/use-auth";

type ListResponse = ApiResponse<AdminUser[]>;
type InstitutionListResponse = ApiResponse<Institution[]>;

export default function AdminUsersPage() {
  const { loading: authLoading, profile } = useRequireAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<AdminUser | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("admin");
  const [institutionId, setInstitutionId] = useState<string>("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const roleOptions = useMemo(() => ["admin", "superadmin"], []);

  const load = async () => {
    setLoading(true);
    const res = await api.get<ListResponse["data"]>("/admin/users", true);
    if (!res.status) {
      setError(res.message || "Gagal memuat user");
    } else {
      setUsers(res.data ?? []);
      setError(null);
    }
    setLoading(false);
  };

  const loadInstitutions = async () => {
    const res = await api.get<InstitutionListResponse["data"]>("/institutions");
    if (res.status && res.data) {
      setInstitutions(res.data);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (profile?.user.role !== "superadmin") {
      setLoading(false);
      return;
    }
    void load();
    void loadInstitutions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, profile?.user.role]);

  const startEdit = (user: AdminUser) => {
    setEditItem(user);
    setName(user.name);
    setEmail(user.email);
    setRole(user.role);
    setInstitutionId(user.institution?.id ? String(user.institution.id) : "");
    setPassword("");
  };

  const cancelEdit = () => {
    setEditItem(null);
    setName("");
    setEmail("");
    setRole("admin");
    setInstitutionId("");
    setPassword("");
  };

  const saveEdit = async () => {
    if (!editItem) return;
    if (!name.trim() || !email.trim()) {
      setError("Nama dan email wajib diisi");
      return;
    }
    setSaving(true);
    const payload: {
      name?: string;
      email?: string;
      role?: string;
      institutionId?: number | null;
      password?: string;
    } = {
      name: name.trim(),
      email: email.trim(),
      role,
    };
    if (role === "admin") {
      payload.institutionId = institutionId ? Number(institutionId) : null;
    } else {
      payload.institutionId = null;
    }
    if (password.trim()) {
      payload.password = password.trim();
    }
    const res = await api.patch<ApiResponse<AdminUser>["data"]>(
      `/admin/users/${editItem.id}`,
      payload,
      true,
    );
    setSaving(false);
    if (!res.status) {
      setError(res.message || "Gagal memperbarui user");
      return;
    }
    cancelEdit();
    void load();
  };

  const removeUser = async (userId: number) => {
    if (!window.confirm("Hapus user ini? Tindakan ini tidak bisa dibatalkan.")) {
      return;
    }
    setDeleteId(userId);
    const res = await api.delete<ApiResponse<null>["data"]>(`/admin/users/${userId}`, true);
    setDeleteId(null);
    if (!res.status) {
      setError(res.message || "Gagal menghapus user");
      return;
    }
    void load();
  };

  if (profile?.user.role !== "superadmin") {
    return (
      <AdminShell title="Manajemen User" description="Khusus superadmin" role={profile?.user.role}>
        <Card className="glass-card">
          <CardContent className="py-6 text-sm text-muted-foreground">
            Akses halaman ini hanya tersedia untuk superadmin.
          </CardContent>
        </Card>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Manajemen User" description="Kelola akun admin dan superadmin" role={profile?.user.role}>
      <Card className="glass-card mb-4">
        <CardHeader>
          <CardTitle>Daftar User</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {error ? <p className="text-sm text-red-500">{error}</p> : null}
          {editItem ? (
            <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Edit User</p>
                <button className="text-xs text-muted-foreground underline" onClick={cancelEdit}>
                  Batal
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Input
                  placeholder="Nama"
                  className="w-52"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <Input
                  placeholder="Email"
                  className="w-56"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Select value={role} onValueChange={(val) => setRole(val)} className="w-44">
                  {roleOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </Select>
                <Select
                  value={institutionId}
                  onValueChange={(val) => setInstitutionId(val)}
                  className="w-56"
                  disabled={role === "superadmin"}
                >
                  <option value="">Tanpa instansi</option>
                  {institutions.map((inst) => (
                    <option key={inst.id} value={String(inst.id)}>
                      {inst.name}
                    </option>
                  ))}
                </Select>
                <Input
                  placeholder="Password baru (opsional)"
                  className="w-56"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button size="sm" onClick={saveEdit} disabled={saving}>
                  {saving ? "Menyimpan..." : "Simpan"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Password tidak ditampilkan. Isi password baru untuk reset.
              </p>
            </div>
          ) : null}
          <div className="overflow-auto border border-border rounded-lg">
            <table className="min-w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-3 py-2">Nama</th>
                  <th className="text-left px-3 py-2">Email</th>
                  <th className="text-left px-3 py-2">Role</th>
                  <th className="text-left px-3 py-2">Instansi</th>
                  <th className="text-left px-3 py-2">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-4 text-center text-muted-foreground">
                      Memuat...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-4 text-center text-muted-foreground">
                      Belum ada user.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="border-t border-border">
                      <td className="px-3 py-2 font-medium">{user.name}</td>
                      <td className="px-3 py-2">{user.email}</td>
                      <td className="px-3 py-2">{user.role}</td>
                      <td className="px-3 py-2">{user.institution?.name ?? "-"}</td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <button
                            className="text-xs text-muted-foreground underline"
                            onClick={() => startEdit(user)}
                          >
                            Edit
                          </button>
                          <button
                            className="text-xs text-red-500 underline"
                            onClick={() => void removeUser(user.id)}
                            disabled={deleteId === user.id}
                          >
                            {deleteId === user.id ? "Menghapus..." : "Hapus"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </AdminShell>
  );
}
