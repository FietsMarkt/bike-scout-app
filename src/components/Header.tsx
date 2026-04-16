import { Bike, Search, Heart, User, Menu, Plus, X, LogOut, LayoutGrid, MessageSquare, Bookmark } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useAuth } from "@/contexts/AuthContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PushOptIn } from "@/components/PushOptIn";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Header = () => {
  const { count } = useFavorites();
  const { user, signOut } = useAuth();
  const { t } = useTranslation();
  const nav = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user) { setUnread(0); return; }
    const load = async () => {
      const { count: c } = await supabase
        .from("messages")
        .select("id, conversations!inner(buyer_id, seller_id)", { count: "exact", head: true })
        .neq("sender_id", user.id)
        .is("read_at", null);
      setUnread(c ?? 0);
    };
    load();
    const channel = supabase
      .channel("hdr-msgs")
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, load)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const navLinks = [
    { label: t("nav.buyBikes"), to: "/zoeken" },
    { label: t("nav.sellBike"), to: "/verkopen" },
    { label: t("nav.parts"), to: "/zoeken?type=Onderdelen" },
    { label: t("nav.dealers"), to: "/dealers" },
    { label: t("nav.magazine"), to: "/magazine" },
  ];

  const handleSignOut = async () => {
    await signOut();
    nav("/");
  };

  return (
    <header className="sticky top-0 z-50 bg-header text-header-foreground">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-extrabold">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-indigo">
            <Bike className="h-5 w-5" />
          </span>
          <span>Fiets<span className="text-primary">Markt</span></span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((l) => (
            <NavLink key={l.label} to={l.to}
              className={({ isActive }) =>
                `px-3 py-2 text-sm font-medium transition-smooth rounded-md hover:bg-white/5 ${
                  isActive ? "text-header-foreground bg-white/10" : "text-header-foreground/80 hover:text-header-foreground"
                }`}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <Link to="/zoeken">
            <Button variant="ghost" size="icon" className="text-header-foreground hover:bg-white/10 hover:text-header-foreground">
              <Search className="h-5 w-5" />
            </Button>
          </Link>
          {user && (
            <Link to="/berichten" className="relative hidden sm:inline-flex" aria-label="Berichten">
              <Button variant="ghost" size="icon" className="text-header-foreground hover:bg-white/10 hover:text-header-foreground">
                <MessageSquare className="h-5 w-5" />
              </Button>
              {unread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 grid min-w-5 h-5 px-1 place-items-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                  {unread}
                </span>
              )}
            </Link>
          )}
          <Link to="/favorieten" className="relative hidden sm:inline-flex">
            <Button variant="ghost" size="icon" className="text-header-foreground hover:bg-white/10 hover:text-header-foreground">
              <Heart className="h-5 w-5" />
            </Button>
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 grid min-w-5 h-5 px-1 place-items-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                {count}
              </span>
            )}
          </Link>

          <PushOptIn variant="compact" />
          <ThemeToggle />
          <LanguageSwitcher />

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="hidden sm:inline-flex text-header-foreground hover:bg-white/10 hover:text-header-foreground gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                    {(user.email ?? "?").charAt(0).toUpperCase()}
                  </span>
                  <span className="max-w-[120px] truncate">{user.email}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-card">
                <DropdownMenuItem asChild><Link to="/mijn-fietsen"><LayoutGrid className="h-4 w-4 mr-2" /> {t("nav.myAds")}</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/berichten"><MessageSquare className="h-4 w-4 mr-2" /> Berichten {unread > 0 && <span className="ml-auto rounded-full bg-primary text-primary-foreground px-1.5 text-[10px] font-bold">{unread}</span>}</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/favorieten"><Heart className="h-4 w-4 mr-2" /> {t("nav.favorites")}</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/zoekopdrachten"><Bookmark className="h-4 w-4 mr-2" /> Bewaarde zoekopdrachten</Link></DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}><LogOut className="h-4 w-4 mr-2" /> {t("nav.logout")}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/inloggen" className="hidden sm:inline-flex">
              <Button variant="ghost" size="sm" className="text-header-foreground hover:bg-white/10 hover:text-header-foreground gap-2">
                <User className="h-4 w-4" /> {t("nav.login")}
              </Button>
            </Link>
          )}

          <Link to="/plaatsen" className="hidden md:inline-flex">
            <Button variant="hero" size="sm" className="gap-1"><Plus className="h-4 w-4" /> {t("nav.placeBike")}</Button>
          </Link>
          <Button variant="ghost" size="icon"
            className="lg:hidden text-header-foreground hover:bg-white/10 hover:text-header-foreground"
            onClick={() => setMobileOpen((o) => !o)} aria-label={t("nav.menu")}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-white/10 bg-header">
          <div className="container py-4 flex flex-col gap-1">
            {navLinks.map((l) => (
              <Link key={l.label} to={l.to} onClick={() => setMobileOpen(false)}
                className="px-3 py-3 rounded-md text-sm font-medium text-header-foreground/90 hover:bg-white/10">
                {l.label}
              </Link>
            ))}
            <div className="border-t border-white/10 my-2" />
            <Link to="/favorieten" onClick={() => setMobileOpen(false)}
              className="px-3 py-3 rounded-md text-sm font-medium text-header-foreground/90 hover:bg-white/10 flex items-center justify-between">
              <span className="inline-flex items-center gap-2"><Heart className="h-4 w-4" /> {t("nav.favorites")}</span>
              {count > 0 && <span className="rounded-full bg-primary px-2 text-xs font-bold">{count}</span>}
            </Link>
            {user ? (
              <>
                <Link to="/berichten" onClick={() => setMobileOpen(false)} className="px-3 py-3 rounded-md text-sm font-medium text-header-foreground/90 hover:bg-white/10 inline-flex items-center justify-between">
                  <span className="inline-flex items-center gap-2"><MessageSquare className="h-4 w-4" /> Berichten</span>
                  {unread > 0 && <span className="rounded-full bg-primary px-2 text-xs font-bold">{unread}</span>}
                </Link>
                <Link to="/zoekopdrachten" onClick={() => setMobileOpen(false)} className="px-3 py-3 rounded-md text-sm font-medium text-header-foreground/90 hover:bg-white/10 inline-flex items-center gap-2">
                  <Bookmark className="h-4 w-4" /> Bewaarde zoekopdrachten
                </Link>
                <Link to="/mijn-fietsen" onClick={() => setMobileOpen(false)} className="px-3 py-3 rounded-md text-sm font-medium text-header-foreground/90 hover:bg-white/10 inline-flex items-center gap-2">
                  <LayoutGrid className="h-4 w-4" /> {t("nav.myAds")}
                </Link>
                <button onClick={() => { setMobileOpen(false); handleSignOut(); }} className="text-left px-3 py-3 rounded-md text-sm font-medium text-header-foreground/90 hover:bg-white/10 inline-flex items-center gap-2">
                  <LogOut className="h-4 w-4" /> {t("nav.logout")}
                </button>
              </>
            ) : (
              <Link to="/inloggen" onClick={() => setMobileOpen(false)} className="px-3 py-3 rounded-md text-sm font-medium text-header-foreground/90 hover:bg-white/10 inline-flex items-center gap-2">
                <User className="h-4 w-4" /> {t("nav.login")}
              </Link>
            )}
            <Link to="/plaatsen" onClick={() => setMobileOpen(false)} className="mt-2">
              <Button variant="hero" className="w-full gap-1"><Plus className="h-4 w-4" /> {t("nav.placeBike")}</Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
