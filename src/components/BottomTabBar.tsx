import { NavLink, useLocation } from "react-router-dom";
import { Home, Search, Plus, MessageSquare, Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

/**
 * Premium native-app style bottom tab bar (dark indigo, blur, indigo accents).
 * Center "Plus" tab is elevated with gradient bg.
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
      "relative flex flex-col items-center justify-center gap-1 flex-1 min-w-0 py-2 text-[11px] font-semibold transition-colors",
      active ? "text-primary" : "text-header-foreground/70",
    );

  const isHome = pathname === "/";
  const isSearch = pathname.startsWith("/zoeken");
  const isMessages = pathname.startsWith("/berichten") || pathname.startsWith("/chat");
  const isFavs = pathname.startsWith("/favorieten");

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 bg-header/95 backdrop-blur-2xl border-t border-white/10 shadow-[0_-12px_40px_rgba(0,0,0,0.35)]"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Hoofdnavigatie"
    >
      <div className="flex items-end h-[72px] max-w-md mx-auto px-2">
        <NavLink to="/" className={tabClass(isHome)} end>
          {isHome && <span className="absolute top-0 h-1 w-10 rounded-b-full bg-primary" />}
          <Home className="h-6 w-6" strokeWidth={isHome ? 2.5 : 2} />
          <span>Home</span>
        </NavLink>

        <NavLink to="/zoeken" className={tabClass(isSearch)}>
          {isSearch && <span className="absolute top-0 h-1 w-10 rounded-b-full bg-primary" />}
          <Search className="h-6 w-6" strokeWidth={isSearch ? 2.5 : 2} />
          <span>Zoeken</span>
        </NavLink>

        {/* Elevated center action */}
        <NavLink
          to="/plaatsen"
          className="flex-1 flex justify-center"
          aria-label="Plaats fiets"
        >
          <span className="-mt-8 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-indigo text-primary-foreground shadow-elevated ring-4 ring-header active:scale-95 transition-transform">
            <Plus className="h-8 w-8" strokeWidth={2.5} />
          </span>
        </NavLink>

        <NavLink to={user ? "/berichten" : "/inloggen"} className={tabClass(isMessages)}>
          {isMessages && <span className="absolute top-0 h-1 w-10 rounded-b-full bg-primary" />}
          <span className="relative">
            <MessageSquare className="h-6 w-6" strokeWidth={isMessages ? 2.5 : 2} />
            {unread > 0 && (
              <span className="absolute -top-1.5 -right-2 grid min-w-[18px] h-[18px] px-1 place-items-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold ring-2 ring-header">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </span>
          <span>Chat</span>
        </NavLink>

        <NavLink to="/favorieten" className={tabClass(isFavs)}>
          {isFavs && <span className="absolute top-0 h-1 w-10 rounded-b-full bg-primary" />}
          <span className="relative">
            <Heart className="h-6 w-6" strokeWidth={isFavs ? 2.5 : 2} />
            {favCount > 0 && (
              <span className="absolute -top-1.5 -right-2 grid min-w-[18px] h-[18px] px-1 place-items-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold ring-2 ring-header">
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
