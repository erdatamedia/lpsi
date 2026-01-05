"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import type { ApiResponse } from "@/lib/types";

type LoginResponse = ApiResponse<{
  accessToken: string;
  user: { id: number; name: string; email: string; role?: string };
  institution?: { id: number; name: string; slug: string; trackingTitle: string };
}>;

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [registerMode, setRegisterMode] = useState(false);
  const [regData, setRegData] = useState({
    name: "",
    slug: "",
    trackingTitle: "",
    adminName: "",
    adminEmail: "",
    adminPassword: "",
    logoUrl: "",
  });
  const [slugStatus, setSlugStatus] = useState<{ available: boolean; checking: boolean }>({
    available: true,
    checking: false,
  });

  // Jika sudah ada token valid, langsung arahkan ke dashboard admin
  useEffect(() => {
    const token = typeof localStorage !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return;
    const check = async () => {
      const res = await api.get<ApiResponse<{ user: unknown }>["data"]>("/auth/profile", true);
      if (res.status) {
        router.replace("/admin/documents");
      }
    };
    void check();
  }, [router]);

  const submit = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post<LoginResponse["data"]>("/auth/login", {
        email,
        password,
      });

      if (!res.status) {
        throw new Error(res.message || "Login gagal");
      }

      api.setToken(res.data?.accessToken ?? "");
      router.push("/admin/documents");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login gagal");
    } finally {
      setLoading(false);
    }
  };

  // Cek ketersediaan slug (debounced)
  useEffect(() => {
    if (!registerMode || !regData.slug.trim()) {
      setSlugStatus({ available: true, checking: false });
      return;
    }
    setSlugStatus({ available: true, checking: true });
    const handle = setTimeout(async () => {
      const res = await api.get<ApiResponse<unknown>["data"]>(
        `/institutions/${regData.slug}`,
      );
      setSlugStatus({ available: !res.status, checking: false });
    }, 400);
    return () => clearTimeout(handle);
  }, [regData.slug, registerMode]);

  const registerLab = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post<LoginResponse["data"]>("/institutions/register", regData);
      if (!res.status) {
        throw new Error(res.message || "Pendaftaran gagal");
      }
      const loginRes = await api.post<LoginResponse["data"]>("/auth/login", {
        email: regData.adminEmail,
        password: regData.adminPassword,
      });
      if (!loginRes.status) {
        throw new Error(loginRes.message || "Login setelah daftar gagal");
      }
      api.setToken(loginRes.data?.accessToken ?? "");
      router.push("/admin/documents");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Pendaftaran gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center px-4 py-10">
      <Card className="w-full max-w-sm glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {registerMode ? "Daftar Lab Baru" : "Login Admin"}
            </CardTitle>
            <button
              className="text-xs text-primary underline"
              onClick={() => setRegisterMode((s) => !s)}
            >
              {registerMode ? "Sudah punya akun?" : "Daftar Lab"}
            </button>
          </div>
          <p className="text-sm text-muted-foreground">
            Kementan - Layanan Pelacakan Hasil Lab multi-lab dengan slug & branding per lab.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {registerMode ? (
            <>
              <Input
                placeholder="Nama Lab"
                value={regData.name}
                onChange={(e) => setRegData({ ...regData, name: e.target.value })}
              />
              <Input
                placeholder="Slug (contoh: labmu)"
                value={regData.slug}
                onChange={(e) => setRegData({ ...regData, slug: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                {slugStatus.checking
                  ? "Memeriksa slug..."
                  : slugStatus.available
                    ? "Slug tersedia"
                    : "Slug sudah dipakai"}
              </p>
              <Input
                placeholder="Judul Tracking"
                value={regData.trackingTitle}
                onChange={(e) => setRegData({ ...regData, trackingTitle: e.target.value })}
              />
              <Input
                placeholder="URL Logo (opsional)"
                value={regData.logoUrl}
                onChange={(e) => setRegData({ ...regData, logoUrl: e.target.value })}
              />
              <Input
                placeholder="Nama Admin"
                value={regData.adminName}
                onChange={(e) => setRegData({ ...regData, adminName: e.target.value })}
              />
              <Input
                placeholder="Email Admin"
                value={regData.adminEmail}
                onChange={(e) => setRegData({ ...regData, adminEmail: e.target.value })}
                autoComplete="email"
              />
              <Input
                type="password"
                placeholder="Password Admin"
                value={regData.adminPassword}
                onChange={(e) => setRegData({ ...regData, adminPassword: e.target.value })}
                autoComplete="new-password"
              />
              <Button
                className="w-full"
                onClick={registerLab}
                disabled={loading}
              >
                {loading ? "Memproses..." : "Daftar & Login"}
              </Button>
            </>
          ) : (
            <>
              <Input
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <Button className="w-full" onClick={submit} disabled={loading}>
                {loading ? "Memproses..." : "Login"}
              </Button>
            </>
          )}
          {error ? <p className="text-sm text-red-500">{error}</p> : null}
        </CardContent>
      </Card>
    </div>
  );
}
