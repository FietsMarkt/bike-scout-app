import { Link, useNavigate } from "react-router-dom";
import { Bike, Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Premium app-style header used only in PWA standalone mode.
 * Transparent over hero gradient, sits over the page content.
 */
export const AppHeader = () => {
  const { user } = useAuth();
  const nav = useNavigate();

  return (
    <header
      className="fixed top-0 inset-x-0 z-40 bg-transparent text-header-foreground"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="px-4 flex h-12 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-display text-base font-extrabold">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-indigo shadow-elevated">
            <Bike className="h-4 w-4" />
          </span>
          <span className="drop-shadow-sm">Fiets<span className="text-primary">Markt</span></span>
        </Link>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Meldingen"
            className="h-9 w-9 text-header-foreground hover:bg-white/10 hover:text-header-foreground rounded-full"
            onClick={() => nav(user ? "/berichten" : "/inloggen")}
          >
            <Bell className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={user ? "Mijn account" : "Inloggen"}
            className="h-9 w-9 text-header-foreground hover:bg-white/10 hover:text-header-foreground rounded-full"
            onClick={() => nav(user ? "/mijn-fietsen" : "/inloggen")}
          >
            {user ? (
              <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-indigo text-primary-foreground text-[11px] font-bold ring-2 ring-white/20">
                {(user.email ?? "?").charAt(0).toUpperCase()}
              </span>
            ) : (
              <User className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
};
