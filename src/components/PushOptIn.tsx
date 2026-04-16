import { useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { isPushSupported, getPushPermission, subscribeToPush, unsubscribeFromPush } from "@/lib/push";

export const PushOptIn = ({ variant = "default" }: { variant?: "default" | "compact" }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [busy, setBusy] = useState(false);
  const supported = isPushSupported();

  useEffect(() => {
    if (supported) setPermission(getPushPermission());
  }, [supported]);

  if (!user || !supported) return null;
  if (permission === "denied") return null;

  const enable = async () => {
    setBusy(true);
    const ok = await subscribeToPush(user.id);
    setBusy(false);
    setPermission(getPushPermission());
    if (ok) toast({ title: "Meldingen aan", description: "Je krijgt nu push-notificaties." });
    else toast({ title: "Niet gelukt", description: "Geef toestemming in je browser.", variant: "destructive" });
  };

  const disable = async () => {
    setBusy(true);
    await unsubscribeFromPush();
    setBusy(false);
    toast({ title: "Meldingen uit" });
  };

  if (permission === "granted") {
    return (
      <Button variant="ghost" size={variant === "compact" ? "icon" : "sm"} onClick={disable} disabled={busy}
        className="text-header-foreground hover:bg-white/10 hover:text-header-foreground gap-2">
        <BellOff className="h-4 w-4" />
        {variant === "default" && <span>Meldingen uit</span>}
      </Button>
    );
  }

  return (
    <Button variant="ghost" size={variant === "compact" ? "icon" : "sm"} onClick={enable} disabled={busy}
      className="text-header-foreground hover:bg-white/10 hover:text-header-foreground gap-2">
      <Bell className="h-4 w-4" />
      {variant === "default" && <span>Meldingen aan</span>}
    </Button>
  );
};
