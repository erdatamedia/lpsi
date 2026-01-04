"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { ApiResponse, Institution } from "@/lib/types";
import { AdminShell } from "@/components/admin/admin-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRequireAuth } from "@/lib/use-auth";
import Image from "next/image";

type InstitutionResponse = ApiResponse<Institution>;

export default function InstitutionSettingsPage() {
  const { loading: authLoading } = useRequireAuth();
  const [inst, setInst] = useState<Institution | null>(null);
  const [name, setName] = useState("");
  const [trackingTitle, setTrackingTitle] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // restore cached branding to keep preview/title when berpindah menu
    if (typeof localStorage !== "undefined") {
      const cached = localStorage.getItem("instLogoUrl");
      const cachedTitle = localStorage.getItem("instTrackingTitle");
      const cachedName = localStorage.getItem("instName");
      if (cached) setLogoUrl(cached);
      if (cachedTitle) setTrackingTitle(cachedTitle);
      if (cachedName) setName(cachedName);
    }
  }, []);

  useEffect(() => {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("instLogoUrl", logoUrl);
      localStorage.setItem("instTrackingTitle", trackingTitle);
      localStorage.setItem("instName", name);
    }
  }, [logoUrl, trackingTitle, name]);

  useEffect(() => {
    if (authLoading) return;
    const load = async () => {
      setError(null);
      setMessage(null);
      const res = await api.get<InstitutionResponse["data"]>("/institutions/me", true);
      if (res.status) {
        setInst(res.data ?? null);
        setName(res.data?.name ?? "");
        setTrackingTitle(res.data?.trackingTitle ?? "");
        setLogoUrl(res.data?.logoUrl || "");
        setError(null);
        setMessage(null);
      } else {
        setError(
          res.message ||
            "Data branding lab belum tersedia. Lengkapi judul tracking dan logo untuk menampilkan identitas lab.",
        );
      }
      setLoading(false);
    };
    void load();
  }, [authLoading]);

  const save = async () => {
    setSaving(true);
    setMessage(null);
    setError(null);
    const res = await api.patch<InstitutionResponse["data"]>(
      "/institutions/me",
      { name, trackingTitle, logoUrl },
      true,
    );
    setSaving(false);
    if (!res.status) {
      setError(res.message || "Gagal menyimpan");
      return;
    }
    setInst(res.data ?? null);
    setMessage("Perubahan tersimpan");
    setError(null);
  };

  const trackingUrl = inst ? `${window.location.origin}/${inst.slug}` : "";

  return (
    <AdminShell title="Pengaturan Lab" description="Ubah judul tracking & logo">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Branding Lab</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? <p>Memuat...</p> : null}
          {!loading && !inst && !name && !trackingTitle && error ? (
            <p className="text-sm text-red-500">{error}</p>
          ) : null}
          {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
          <div className="space-y-1">
            <Input
              placeholder="Nama Lab"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Nama instansi/lab.</p>
          </div>
          <Input
            placeholder="Judul Tracking"
            value={trackingTitle}
            onChange={(e) => setTrackingTitle(e.target.value)}
          />
          <Input
            placeholder="URL Logo (opsional)"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
          />
          {logoUrl ? (
            <div className="flex items-center gap-3">
              <div className="h-16 w-16 rounded-lg border border-border bg-card/80 grid place-items-center overflow-hidden">
                <Image
                  src={logoUrl}
                  alt="Preview logo"
                  width={64}
                  height={64}
                  className="h-16 w-16 object-contain"
                  unoptimized
                />
              </div>
              <div className="text-xs text-muted-foreground">
                Preview logo (ubah URL untuk mengganti).
              </div>
            </div>
          ) : null}
          {inst ? (
            <div className="text-sm text-muted-foreground">
              URL Tracking:{" "}
              <code className="bg-muted px-1.5 py-1 rounded">
                {trackingUrl || `/${inst.slug}`}
              </code>
            </div>
          ) : null}
          <Button onClick={save} disabled={saving}>
            {saving ? "Menyimpan..." : "Simpan"}
          </Button>
        </CardContent>
      </Card>
    </AdminShell>
  );
}
