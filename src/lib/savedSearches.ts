import { supabase } from "@/integrations/supabase/client";

export type SavedSearch = {
  id: string;
  user_id: string;
  name: string;
  filters: Record<string, unknown>;
  notify_email: boolean;
  notify_push: boolean;
  last_checked_at: string;
  created_at: string;
};

export const listSavedSearches = async (userId: string): Promise<SavedSearch[]> => {
  const { data } = await supabase
    .from("saved_searches")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return (data ?? []) as SavedSearch[];
};

export const createSavedSearch = async (userId: string, name: string, filters: Record<string, unknown>) => {
  const { data, error } = await supabase
    .from("saved_searches")
    .insert({ user_id: userId, name: name.trim().slice(0, 80), filters })
    .select()
    .maybeSingle();
  if (error) throw error;
  return data as SavedSearch;
};

export const deleteSavedSearch = async (id: string) => {
  await supabase.from("saved_searches").delete().eq("id", id);
};

export const updateSavedSearchNotify = async (id: string, notify_push: boolean, notify_email: boolean) => {
  await supabase.from("saved_searches").update({ notify_push, notify_email }).eq("id", id);
};
