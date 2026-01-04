import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "./api";
import type { ApiResponse, User, Institution } from "./types";

type ProfileData = {
  user: User;
  institution: Institution | null;
};

export function useRequireAuth() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = typeof localStorage !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      router.replace("/login");
      return;
    }
    const check = async () => {
      const res = await api.get<ApiResponse<ProfileData>["data"]>("/auth/profile", true);
      if (!res.status) {
        api.clearToken();
        router.replace("/login");
        return;
      }
      setProfile(res.data ?? null);
      setLoading(false);
    };
    void check();
  }, [router]);

  return { profile, loading };
}
