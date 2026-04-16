import { useEffect, useRef, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { sendMessage, markConversationRead, type Message } from "@/lib/chat";
import { ChevronLeft, Send } from "lucide-react";

const ConversationPage = () => {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const nav = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [otherName, setOtherName] = useState("Gebruiker");
  const [bikeTitle, setBikeTitle] = useState("");
  const [bikeId, setBikeId] = useState<string | null>(null);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { document.title = "Gesprek | FietsMarkt"; }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { nav("/inloggen"); return; }
    if (!id) return;

    (async () => {
      const { data: conv } = await supabase
        .from("conversations").select("*").eq("id", id).maybeSingle();
      if (!conv) { setLoading(false); return; }
      setBikeId(conv.bike_id);
      const otherId = conv.buyer_id === user.id ? conv.seller_id : conv.buyer_id;
      const [{ data: prof }, { data: bike }, { data: msgs }] = await Promise.all([
        supabase.from("public_profiles").select("display_name").eq("user_id", otherId).maybeSingle(),
        supabase.from("bikes").select("title").eq("id", conv.bike_id).maybeSingle(),
        supabase.from("messages").select("*").eq("conversation_id", id).order("created_at"),
      ]);
      setOtherName(prof?.display_name ?? "Gebruiker");
      setBikeTitle(bike?.title ?? "");
      setMessages((msgs ?? []) as Message[]);
      setLoading(false);
      markConversationRead(id, user.id);
    })();

    const channel = supabase
      .channel(`conv-${id}`)
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${id}`,
      }, (payload) => {
        setMessages((prev) => {
          if (prev.some((m) => m.id === (payload.new as Message).id)) return prev;
          return [...prev, payload.new as Message];
        });
        if (user) markConversationRead(id, user.id);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [id, user, authLoading, nav]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id || !body.trim() || sending) return;
    setSending(true);
    try {
      await sendMessage(id, user.id, body);
      setBody("");
    } finally { setSending(false); }
  };

  if (loading) return <Layout><div className="container py-20 text-center text-muted-foreground">Laden…</div></Layout>;

  return (
    <Layout>
      <div className="container py-6 max-w-2xl">
        <Link to="/berichten" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-4 w-4" /> Alle gesprekken
        </Link>

        <div className="mt-4 rounded-2xl border border-border bg-card overflow-hidden flex flex-col h-[70vh]">
          <div className="border-b border-border p-4 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h1 className="font-display font-bold truncate">{otherName}</h1>
              {bikeId && bikeTitle && (
                <Link to={`/fiets/${bikeId}`} className="text-xs text-primary hover:underline truncate block">{bikeTitle}</Link>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-8">Stuur het eerste bericht.</p>
            )}
            {messages.map((m) => {
              const mine = m.sender_id === user?.id;
              return (
                <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap break-words ${
                    mine ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                  }`}>
                    {m.body}
                    <div className={`text-[10px] mt-1 ${mine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                      {new Date(m.created_at).toLocaleTimeString("nl-BE", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={endRef} />
          </div>

          <form onSubmit={submit} className="border-t border-border p-3 flex gap-2">
            <Input value={body} onChange={(e) => setBody(e.target.value)} placeholder="Typ een bericht…" maxLength={2000} />
            <Button type="submit" variant="hero" disabled={!body.trim() || sending} className="gap-2">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default ConversationPage;
