import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { BikeCard } from "@/components/BikeCard";
import { BikeGridSkeleton } from "@/components/BikeCardSkeleton";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useFavoriteBikes } from "@/hooks/useBikes";
import { Heart } from "lucide-react";

const Favorites = () => {
  const { user, loading: authLoading } = useAuth();
  const { ids } = useFavorites();
  const { data: list = [], isLoading } = useFavoriteBikes(user?.id);

  useEffect(() => { document.title = "Mijn favorieten | FietsMarkt"; }, []);

  if (authLoading) return <Layout><div className="container py-20 text-center text-muted-foreground">Laden…</div></Layout>;

  if (!user) {
    return (
      <Layout>
        <div className="container py-20 text-center max-w-md mx-auto">
          <span className="grid h-14 w-14 mx-auto place-items-center rounded-full bg-primary-soft text-primary">
            <Heart className="h-6 w-6" />
          </span>
          <h1 className="mt-4 font-display text-2xl font-bold">Log in voor favorieten</h1>
          <p className="text-muted-foreground mt-2">Maak een account aan om fietsen te bewaren en terug te vinden.</p>
          <Link to="/inloggen"><Button variant="hero" className="mt-5">Inloggen of registreren</Button></Link>
        </div>
      </Layout>
    );
  }

  // Filter out bikes that are no longer favorited locally (optimistic)
  const visible = list.filter((b) => ids.includes(b.id));

  return (
    <Layout>
      <div className="container py-10">
        <div>
          <h1 className="font-display text-3xl font-extrabold">Mijn favorieten</h1>
          <p className="text-sm text-muted-foreground mt-1">{isLoading ? "Laden..." : `${visible.length} bewaarde fietsen`}</p>
        </div>

        {isLoading ? (
          <div className="mt-8"><BikeGridSkeleton count={4} /></div>
        ) : visible.length === 0 ? (
          <div className="mt-10 text-center py-16 border border-dashed border-border rounded-2xl">
            <span className="grid h-14 w-14 mx-auto place-items-center rounded-full bg-primary-soft text-primary">
              <Heart className="h-6 w-6" />
            </span>
            <h2 className="mt-4 font-display text-lg font-bold">Nog geen favorieten</h2>
            <p className="text-sm text-muted-foreground mt-1">Klik op het hartje bij een fiets om hem te bewaren.</p>
            <Link to="/zoeken"><Button variant="hero" className="mt-5">Bekijk fietsen</Button></Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visible.map((b) => <Link key={b.id} to={`/fiets/${b.id}`}><BikeCard bike={b} /></Link>)}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Favorites;
