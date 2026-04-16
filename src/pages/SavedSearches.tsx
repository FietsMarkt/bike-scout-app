import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { listSavedSearches, deleteSavedSearch, updateSavedSearchNotify, type SavedSearch } from "@/lib/savedSearches";
import { useToast } from "@/hooks/use-toast";
import { Bookmark, Trash2 } from "lucide-react";
import { PushOptIn } from "@/components/PushOptIn";

const filtersToQuery = (f: Record<string, unknown>) => {
  const p = new URLSearchParams();
  Object.entries(f).forEach(([k, v]) => { if (v) p.set(k, String(v)); });
  return p.toString();
};

const filtersToLabel = (f: Record<string, unknown>) =>
  Object.entries(f).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join(" · ") || "Alle fietsen";

const SavedSearches = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [list, setList] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { document.title = "Bewaarde zoekopdrachten | FietsMarkt"; }, []);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    listSavedSearches(user.id).then(setList).finally(() => setLoading(false));
  }, [user]);

  const remove = async (id: string) => {
    if (!confirm("Verwijder deze zoekopdracht?")) return;
    await deleteSavedSearch(id);
    setList((prev) => prev.filter((s) => s.id !== id));
    toast({ title: "Zoekopdracht verwijderd" });
  };

  const togglePush = async (s: SavedSearch, value: boolean) => {
    setList((prev) => prev.map((x) => x.id === s.id ? { ...x, notify_push: value } : x));
    await updateSavedSearchNotify(s.id, value, s.notify_email);
  };

  if (authLoading) return <Layout><div className="container py-20 text-center text-muted-foreground">Laden…</div></Layout>;

  if (!user) {
    return (
      <Layout>
        <div className="container py-20 text-center max-w-md mx-auto">
          <span className="grid h-14 w-14 mx-auto place-items-center rounded-full bg-primary-soft text-primary">
            <Bookmark className="h-6 w-6" />
          </span>
          <h1 className="mt-4 font-display text-2xl font-bold">Log in voor zoekopdrachten</h1>
          <p className="text-muted-foreground mt-2">Bewaar je zoekopdrachten en krijg meldingen bij nieuwe matches.</p>
          <Link to="/inloggen"><Button variant="hero" className="mt-5">Inloggen</Button></Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-10 max-w-3xl">
        <div className="flex items-end justify-between gap-3 flex-wrap">
          <div>
            <h1 className="font-display text-3xl font-extrabold">Bewaarde zoekopdrachten</h1>
            <p className="text-sm text-muted-foreground mt-1">{loading ? "Laden..." : `${list.length} bewaard`}</p>
          </div>
          <div className="rounded-lg bg-header text-header-foreground px-2 py-1"><PushOptIn /></div>
        </div>

        {!loading && list.length === 0 ? (
          <div className="mt-10 text-center py-16 border border-dashed border-border rounded-2xl">
            <span className="grid h-14 w-14 mx-auto place-items-center rounded-full bg-primary-soft text-primary">
              <Bookmark className="h-6 w-6" />
            </span>
            <h2 className="mt-4 font-display text-lg font-bold">Nog geen zoekopdrachten</h2>
            <p className="text-sm text-muted-foreground mt-1">Sla een zoekopdracht op vanaf de zoekpagina om hier meldingen te krijgen.</p>
            <Link to="/zoeken"><Button variant="hero" className="mt-5">Naar zoeken</Button></Link>
          </div>
        ) : (
          <ul className="mt-6 space-y-3">
            {list.map((s) => (
              <li key={s.id} className="rounded-xl border border-border bg-card p-4 flex items-center gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <Link to={`/zoeken?${filtersToQuery(s.filters)}`} className="font-display font-bold hover:text-primary">{s.name}</Link>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{filtersToLabel(s.filters)}</p>
                </div>
                <label className="inline-flex items-center gap-2 text-xs">
                  <Switch checked={s.notify_push} onCheckedChange={(v) => togglePush(s, v)} />
                  <span className="text-muted-foreground">Push</span>
                </label>
                <Button variant="ghost" size="icon" onClick={() => remove(s.id)} aria-label="Verwijder">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Layout>
  );
};

export default SavedSearches;
