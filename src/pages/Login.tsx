import { Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { Mail, Lock, User as UserIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const { toast } = useToast();
  const nav = useNavigate();
  const { user } = useAuth();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (user) nav("/"); }, [user, nav]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (tab === "register") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { full_name: name },
          },
        });
        if (error) throw error;
        toast({ title: "Account aangemaakt!", description: "Je bent ingelogd." });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast({ title: "Welkom terug!" });
      }
      nav("/");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Er ging iets mis";
      toast({ title: "Inloggen mislukt", description: msg, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const oauth = async (provider: "google" | "apple") => {
    setBusy(true);
    const { error } = await lovable.auth.signInWithOAuth(provider, { redirect_uri: `${window.location.origin}/` });
    if (error) {
      const m = error instanceof Error ? error.message : String(error);
      toast({ title: "Login mislukt", description: m, variant: "destructive" });
      setBusy(false);
    }
  };

  return (
    <Layout>
      <div className="container py-12 max-w-md">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-elevated">
          <div className="flex border-b border-border mb-6">
            {(["login", "register"] as const).map((t) => (
              <button key={t} type="button" onClick={() => setTab(t)}
                className={`flex-1 px-4 py-3 text-sm font-semibold transition-smooth border-b-2 ${
                  tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}>
                {t === "login" ? "Inloggen" : "Registreren"}
              </button>
            ))}
          </div>

          <h1 className="font-display text-2xl font-extrabold">
            {tab === "login" ? "Welkom terug" : "Maak een account aan"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {tab === "login" ? "Log in om je favorieten en advertenties te beheren." : "Begin met kopen of verkopen op FietsMarkt."}
          </p>

          <div className="mt-6 grid grid-cols-2 gap-2">
            <Button type="button" variant="outline" onClick={() => oauth("google")} disabled={busy}>
              <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="#EA4335" d="M12 5.04c1.7 0 3.22.59 4.42 1.74l3.3-3.3C17.45 1.6 14.97.5 12 .5 7.31.5 3.26 3.18 1.28 7.07l3.84 2.98C6.04 7.07 8.78 5.04 12 5.04z"/><path fill="#4285F4" d="M23.5 12.27c0-.83-.07-1.62-.2-2.39H12v4.51h6.46c-.28 1.5-1.13 2.78-2.4 3.64l3.71 2.88c2.17-2 3.43-4.95 3.43-8.64z"/><path fill="#FBBC05" d="M5.12 14.34a7.27 7.27 0 0 1 0-4.69L1.28 6.67A11.5 11.5 0 0 0 .5 12c0 1.86.45 3.62 1.28 5.33l3.84-2.99z"/><path fill="#34A853" d="M12 23.5c3.24 0 5.96-1.07 7.94-2.91l-3.71-2.88c-1.03.7-2.36 1.11-4.23 1.11-3.22 0-5.96-2.03-6.94-4.99L1.28 16.8C3.26 20.69 7.31 23.5 12 23.5z"/></svg>
              Google
            </Button>
            <Button type="button" variant="outline" onClick={() => oauth("apple")} disabled={busy}>
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 12.04c-.03-2.85 2.32-4.22 2.43-4.29-1.32-1.94-3.39-2.2-4.12-2.23-1.75-.18-3.42 1.03-4.31 1.03-.91 0-2.27-1.01-3.74-.98-1.92.03-3.7 1.12-4.69 2.84-2 3.46-.51 8.58 1.43 11.39.95 1.38 2.07 2.92 3.55 2.86 1.43-.06 1.97-.92 3.7-.92s2.21.92 3.72.89c1.54-.03 2.51-1.4 3.45-2.78 1.09-1.6 1.54-3.16 1.56-3.24-.03-.01-2.99-1.15-3.02-4.57zM14.21 3.66c.79-.96 1.32-2.29 1.18-3.62-1.14.05-2.51.76-3.33 1.71-.73.84-1.37 2.21-1.2 3.51 1.27.1 2.57-.65 3.35-1.6z"/></svg>
              Apple
            </Button>
          </div>

          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> of <span className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={submit} className="space-y-3">
            {tab === "register" && (
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input className="pl-9" placeholder="Volledige naam" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
            )}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="E-mailadres" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Wachtwoord (min. 6 tekens)" type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required />
            </div>
            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={busy}>
              {busy ? "Bezig..." : tab === "login" ? "Inloggen" : "Account aanmaken"}
            </Button>
          </form>

          {tab === "login" && (
            <p className="text-center text-sm text-muted-foreground mt-4">
              Nog geen account?{" "}
              <button type="button" onClick={() => setTab("register")} className="text-primary font-semibold hover:underline">Registreren</button>
            </p>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          <Link to="/" className="hover:underline">← Terug naar home</Link>
        </p>
      </div>
    </Layout>
  );
};

export default Login;
