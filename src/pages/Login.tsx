import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Mail, Lock } from "lucide-react";

const Login = () => {
  const { toast } = useToast();
  const [tab, setTab] = useState<"login" | "register">("login");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Backend nog niet aangesloten",
      description: "Activeer Lovable Cloud om echte authenticatie aan te zetten.",
    });
  };

  return (
    <Layout>
      <div className="container py-12 max-w-md">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-elevated">
          <div className="flex border-b border-border mb-6">
            {(["login", "register"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 px-4 py-3 text-sm font-semibold transition-smooth border-b-2 ${
                  tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
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

          <form onSubmit={submit} className="mt-6 space-y-3">
            {tab === "register" && (
              <Input placeholder="Volledige naam" required />
            )}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="E-mailadres" type="email" required />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Wachtwoord" type="password" required />
            </div>
            <Button type="submit" variant="hero" size="lg" className="w-full">
              {tab === "login" ? "Inloggen" : "Account aanmaken"}
            </Button>
          </form>

          {tab === "login" && (
            <p className="text-center text-sm text-muted-foreground mt-4">
              Nog geen account?{" "}
              <button onClick={() => setTab("register")} className="text-primary font-semibold hover:underline">Registreren</button>
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
