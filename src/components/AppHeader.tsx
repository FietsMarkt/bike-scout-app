import { Link, useNavigate } from "react-router-dom";
import { Bike, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Compact app-style header used only in PWA standalone mode.
 * Logo + quick search + account icon. No nav links — those live in the BottomTabBar.
 */
export const AppHeader = () => {
  const { user } = useAuth();
  const nav = useNavigate();

  return (
    <header
      className="sticky top-0 z-40 bg-header text-header-foreground"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="px-4 flex h-12 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-display text-base font-extrabold">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-gradient-indigo">
            <Bike className="h-4 w-4" />
          </span>
          <span>Fiets<span className="text-primary">Markt</span></span>
        </Link>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Zoeken"
            className="h-9 w-9 text-header-foreground hover:bg-white/10 hover:text-header-foreground"
            onClick={() => nav("/zoeken")}
          >
            <Search className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={user ? "Mijn account" : "Inloggen"}
            className="h-9 w-9 text-header-foreground hover:bg-white/10 hover:text-header-foreground"
            onClick={() => nav(user ? "/mijn-fietsen" : "/inloggen")}
          >
            {user ? (
              <span className="grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground text-[11px] font-bold">
                {(user.email ?? "?").charAt(0).toUpperCase()}
              </span>
            ) : (
              <User className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
};
