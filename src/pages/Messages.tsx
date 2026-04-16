import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquare } from "lucide-react";

type ConversationRow = {
  id: string;
  bike_id: string;
  buyer_id: string;
  seller_id: string;
  last_message_at: string;
};

const Messages = () => {
  const { user, loading: authLoading } = useAuth();
  const [convs, setConvs] = useState<Array<ConversationRow & { bike_title: string; bike_image: string; other_name: string; last_body: string; unread: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { document.title = "Berichten | FietsMarkt"; }, []);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    (async () => {
      setLoading(true);
      const { data: rawConvs } = await supabase
        .from("conversations").select("*")
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order("last_message_at", { ascending: false });
      if (!rawConvs) { setLoading(false); return; }

      const enriched = await Promise.all(rawConvs.map(async (c) => {
        const otherId = c.buyer_id === user.id ? c.seller_id : c.buyer_id;
        const [{ data: bike }, { data: prof }, { data: lastMsg }, { count: unread }] = await Promise.all([
          supabase.from("bikes").select("title, images").eq("id", c.bike_id).maybeSingle(),
          supabase.from("public_profiles").select("display_name").eq("user_id", otherId).maybeSingle(),
          supabase.from("messages").select("body").eq("conversation_id", c.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
          supabase.from("messages").select("id", { count: "exact", head: true }).eq("conversation_id", c.id).neq("sender_id", user.id).is("read_at", null),
        ]);
        return {
          ...c,
          bike_title: bike?.title ?? "Verwijderde fiets",
          bike_image: ((bike?.images as string[] | null) ?? [])[0] ?? "",
          other_name: prof?.display_name ?? "Gebruiker",
          last_body: lastMsg?.body ?? "Nog geen berichten",
          unread: unread ?? 0,
        };
      }));
      setConvs(enriched);
      setLoading(false);
    })();
  }, [user]);

  if (authLoading) return <Layout><div className="container py-20 text-center text-muted-foreground">Laden…</div></Layout>;

  if (!user) {
    return (
      <Layout>
        <div className="container py-20 text-center max-w-md mx-auto">
          <span className="grid h-14 w-14 mx-auto place-items-center rounded-full bg-primary-soft text-primary">
            <MessageSquare className="h-6 w-6" />
          </span>
          <h1 className="mt-4 font-display text-2xl font-bold">Log in voor berichten</h1>
          <Link to="/inloggen"><Button variant="hero" className="mt-5">Inloggen</Button></Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-10 max-w-3xl">
        <h1 className="font-display text-3xl font-extrabold">Berichten</h1>
        <p className="text-sm text-muted-foreground mt-1">{loading ? "Laden..." : `${convs.length} gesprekken`}</p>

        {!loading && convs.length === 0 ? (
          <div className="mt-10 text-center py-16 border border-dashed border-border rounded-2xl">
            <span className="grid h-14 w-14 mx-auto place-items-center rounded-full bg-primary-soft text-primary">
              <MessageSquare className="h-6 w-6" />
            </span>
            <h2 className="mt-4 font-display text-lg font-bold">Nog geen gesprekken</h2>
            <p className="text-sm text-muted-foreground mt-1">Stuur een verkoper een bericht via een advertentie.</p>
            <Link to="/zoeken"><Button variant="hero" className="mt-5">Bekijk fietsen</Button></Link>
          </div>
        ) : (
          <ul className="mt-6 divide-y divide-border rounded-xl border border-border bg-card">
            {convs.map((c) => (
              <li key={c.id}>
                <Link to={`/berichten/${c.id}`} className="flex items-center gap-3 p-4 hover:bg-muted/50 transition-smooth">
                  <div className="h-14 w-14 rounded-lg overflow-hidden bg-muted shrink-0">
                    {c.bike_image && <img src={c.bike_image} alt={c.bike_title} className="h-full w-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold truncate">{c.other_name}</span>
                      <span className="text-xs text-muted-foreground shrink-0">{new Date(c.last_message_at).toLocaleDateString("nl-BE")}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{c.bike_title}</p>
                    <p className="text-sm text-muted-foreground truncate mt-0.5">{c.last_body}</p>
                  </div>
                  {c.unread > 0 && (
                    <span className="grid min-w-6 h-6 px-1.5 place-items-center rounded-full bg-primary text-primary-foreground text-xs font-bold">{c.unread}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Layout>
  );
};

export default Messages;
