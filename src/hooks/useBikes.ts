import { useQuery } from "@tanstack/react-query";
import { fetchBikes, fetchBikeById, fetchMyBikes, fetchFavoriteBikes, type BikeFilters } from "@/lib/bikes";
import { supabase } from "@/integrations/supabase/client";

export const useBikes = (filters: BikeFilters) =>
  useQuery({
    queryKey: ["bikes", filters],
    queryFn: () => fetchBikes(filters),
    staleTime: 60_000,
  });

export const useBike = (id: string | undefined) =>
  useQuery({
    queryKey: ["bike", id],
    queryFn: () => fetchBikeById(id!),
    enabled: !!id,
    staleTime: 60_000,
  });

export const useMyBikes = (userId: string | undefined) =>
  useQuery({
    queryKey: ["my-bikes", userId],
    queryFn: () => fetchMyBikes(userId!),
    enabled: !!userId,
  });

export const useFavoriteBikes = (userId: string | undefined) =>
  useQuery({
    queryKey: ["favorite-bikes", userId],
    queryFn: () => fetchFavoriteBikes(userId!),
    enabled: !!userId,
  });

export const useBikeCount = () =>
  useQuery({
    queryKey: ["bikes-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("bikes")
        .select("id", { count: "exact", head: true })
        .eq("status", "active");
      return count ?? 0;
    },
    staleTime: 5 * 60_000,
  });

export const useSellerProfile = (userId: string | undefined) =>
  useQuery({
    queryKey: ["seller", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("public_profiles").select("*").eq("user_id", userId!).maybeSingle();
      return data;
    },
    enabled: !!userId,
  });

export const useSellerBikes = (userId: string | undefined) =>
  useQuery({
    queryKey: ["seller-bikes", userId],
    queryFn: () => fetchMyBikes(userId!),
    enabled: !!userId,
  });
