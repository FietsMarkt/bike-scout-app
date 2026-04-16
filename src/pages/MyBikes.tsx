import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { BikeCard } from "@/components/BikeCard";
import { BikeGridSkeleton } from "@/components/BikeCardSkeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useMyBikes } from "@/hooks/useBikes";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2 } from "lucide-react";

const MyBikes = () => {
  const { user, loading: authLoading } = useAuth();
  const nav = useNavigate();
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: list = [], isLoading } = useMyBikes(user?.id);

  useEffect(() => {
    if (!authLoading && !user) nav("/inloggen");
  }, [user, authLoading, nav]);

  const remove = async (id: string) => {
    if (!confirm("Weet je zeker dat je deze advertentie wilt verwijderen?")) return;
    const { error } = await supabase.from("bikes").delete().eq("id", id);
    if (error) { toast({ title: "Verwijderen mislukt", variant: "destructive" }); return; }
    qc.invalidateQueries({ queryKey: ["my-bikes", user?.id] });
    qc.invalidateQueries({ queryKey: ["bikes"] });
    toast({ title: "Advertentie verwijderd" });
  };

  return (
    <Layout>
      <div className="container py-10">
        <div className="flex items-end justify-between gap-3 flex-wrap">
          <div>
            <h1 className="font-display text-3xl font-extrabold">Mijn advertenties</h1>
            <p className="text-sm text-muted-foreground mt-1">{isLoading ? "Laden..." : `${list.length} advertenties`}</p>
          </div>
          <Link to="/plaatsen"><Button variant="hero" className="gap-1"><Plus className="h-4 w-4" /> Nieuwe advertentie</Button></Link>
        </div>

        {isLoading ? (
          <div className="mt-8"><BikeGridSkeleton count={4} /></div>
        ) : list.length === 0 ? (
          <div className="mt-10 text-center py-16 border border-dashed border-border rounded-2xl">
            <h2 className="font-display text-lg font-bold">Nog geen advertenties</h2>
            <p className="text-sm text-muted-foreground mt-1">Plaats je eerste fiets en bereik duizenden kopers.</p>
            <Link to="/plaatsen"><Button variant="hero" className="mt-5">Plaats een fiets</Button></Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {list.map((b) => (
              <div key={b.id} className="relative group">
                <Link to={`/fiets/${b.id}`}><BikeCard bike={b} /></Link>
                <button onClick={() => remove(b.id)}
                  className="absolute top-3 left-3 grid h-9 w-9 place-items-center rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-smooth shadow-elevated"
                  aria-label="Verwijderen">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyBikes;
