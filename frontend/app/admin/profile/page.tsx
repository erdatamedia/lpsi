"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { ApiResponse, User, Institution } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminShell } from "@/components/admin/admin-shell";
import { useRequireAuth } from "@/lib/use-auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type ProfileData = {
  user: User;
  institution: Institution | null;
};

export default function AdminProfilePage() {
  const { loading: authLoading } = useRequireAuth();
  const [data, setData] = useState<ProfileData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (authLoading) return;
    const load = async () => {
      const res = await api.get<ApiResponse<ProfileData>["data"]>("/auth/profile", true);
      if (!res.status) {
        setError(res.message || "Gagal memuat profil");
      } else {
        setData(res.data ?? null);
        setName(res.data?.user.name ?? "");
        setEmail(res.data?.user.email ?? "");
      }
      setLoading(false);
    };
    void load();
  }, [authLoading]);

  const save = async () => {
    setSaving(true);
    const res = await api.post<ApiResponse<ProfileData>["data"]>(
      "/auth/profile",
      { name, email },
      true,
    );
    setSaving(false);
    if (!res.status) {
      setError(res.message || "Gagal menyimpan profil");
      return;
    }
    setData(res.data ?? null);
    setError(null);
  };

  return (
    <AdminShell title="Profil Admin" description="Data pengguna dan instansi">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Data Pengguna</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          {loading ? <p>Memuat...</p> : null}
          {error ? <p className="text-red-500">{error}</p> : null}
          {data ? (
            <>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Nama</p>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Email</p>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <Button size="sm" onClick={save} disabled={saving}>
                {saving ? "Menyimpan..." : "Simpan"}
              </Button>
              {data.institution ? (
                <div>
                  <span className="text-foreground">Instansi:</span>{" "}
                  {data.institution.name} ({data.institution.slug})
                </div>
              ) : (
                <div className="text-yellow-600">
                  User belum terhubung ke instansi.
                </div>
              )}
            </>
          ) : null}
        </CardContent>
      </Card>
    </AdminShell>
  );
}
