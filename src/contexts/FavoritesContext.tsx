import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { haptic } from "@/lib/haptic";

type FavoritesContextType = {
  ids: string[];
  toggle: (bikeId: string) => Promise<void>;
  has: (id: string) => boolean;
  count: number;
};

const FavoritesContext = createContext<FavoritesContextType | null>(null);

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    if (!user) { setIds([]); return; }
    supabase
      .from("favorites")
      .select("bike_id")
      .eq("user_id", user.id)
      .then(({ data }) => setIds((data ?? []).map((r) => r.bike_id)));
  }, [user]);

  const toggle = useCallback(async (bikeId: string) => {
    if (!user) {
      window.location.href = "/inloggen";
      return;
    }
    if (ids.includes(bikeId)) {
      setIds((prev) => prev.filter((x) => x !== bikeId));
      haptic("light");
      toast("Verwijderd uit favorieten");
      await supabase.from("favorites").delete().eq("user_id", user.id).eq("bike_id", bikeId);
    } else {
      setIds((prev) => [...prev, bikeId]);
      haptic("success");
      toast.success("Toegevoegd aan favorieten");
      await supabase.from("favorites").insert({ user_id: user.id, bike_id: bikeId });
    }
  }, [user, ids]);

  const has = useCallback((id: string) => ids.includes(id), [ids]);

  const value = useMemo(() => ({ ids, toggle, has, count: ids.length }), [ids, toggle, has]);
  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
};

export const useFavorites = () => {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
};
