import { NavLink, useLocation } from "react-router-dom";
import { Home, Search, Plus, MessageSquare, Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

/**
 * Native-app style bottom tab bar. Rendered only in PWA standalone mode.
 * Center "Plus" tab is visually elevated as a primary action.
 */
export const BottomTabBar = () => {
  const { user } = useAuth();
  const { count: favCount } = useFavorites();
  const [unread, setUnread] = useState(0);
  const { pathname } = useLocation();

  useEffect(() => {
    if (!user) { setUnread(0); return; }
    const load = async () => {
      const { count } = await supabase
        .from("messages")
        .select("id, conversations!inner(buyer_id, seller_id)", { count: "exact", head: true })
        .neq("sender_id", user.id)
        .is("read_at", null);
      setUnread(count ?? 0);
    };
    load();
    const ch = supabase
      .channel("tab-msgs")
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user]);

  const tabClass = (active: boolean) =>
    cn(
      "flex flex-col items-center justify-center gap-0.5 flex-1 min-w-0 py-1.5 text-[10px] font-medium transition-colors",
      active ? "text-primary" : "text-muted-foreground",
    );

  const isHome = pathname === "/";
  const isSearch = pathname.startsWith("/zoeken");
  const isMessages = pathname.startsWith("/berichten") || pathname.startsWith("/chat");
  const isFavs = pathname.startsWith("/favorieten");

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 bg-card/95 backdrop-blur border-t border-border"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Hoofdnavigatie"
    >
      <div className="flex items-end h-16 max-w-md mx-auto px-1">
        <NavLink to="/" className={tabClass(isHome)} end>
          <Home className="h-5 w-5" />
          <span>Home</span>
        </NavLink>
        <NavLink to="/zoeken" className={tabClass(isSearch)}>
          <Search className="h-5 w-5" />
          <span>Zoeken</span>
        </NavLink>

        {/* Elevated center action */}
        <NavLink
          to="/plaatsen"
          className="flex-1 flex justify-center"
          aria-label="Plaats fiets"
        >
          <span className="-mt-5 grid h-14 w-14 place-items-center rounded-full bg-gradient-indigo text-primary-foreground shadow-lg shadow-primary/30 active:scale-95 transition-transform">
            <Plus className="h-7 w-7" strokeWidth={2.5} />
          </span>
        </NavLink>

        <NavLink to={user ? "/berichten" : "/inloggen"} className={tabClass(isMessages)}>
          <span className="relative">
            <MessageSquare className="h-5 w-5" />
            {unread > 0 && (
              <span className="absolute -top-1.5 -right-2 grid min-w-4 h-4 px-1 place-items-center rounded-full bg-primary text-primary-foreground text-[9px] font-bold">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </span>
          <span>Chat</span>
        </NavLink>
        <NavLink to="/favorieten" className={tabClass(isFavs)}>
          <span className="relative">
            <Heart className="h-5 w-5" />
            {favCount > 0 && (
              <span className="absolute -top-1.5 -right-2 grid min-w-4 h-4 px-1 place-items-center rounded-full bg-primary text-primary-foreground text-[9px] font-bold">
                {favCount > 9 ? "9+" : favCount}
              </span>
            )}
          </span>
          <span>Favs</span>
        </NavLink>
      </div>
    </nav>
  );
};
