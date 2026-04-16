import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { BikeCard } from "@/components/BikeCard";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/contexts/FavoritesContext";
import { getAllBikes } from "@/lib/bikes";
import { Heart } from "lucide-react";

const Favorites = () => {
  const { ids, clear } = useFavorites();
  useEffect(() => { document.title = "Mijn favorieten | FietsMarkt"; }, []);

  const list = useMemo(() => getAllBikes().filter((b) => ids.includes(b.id)), [ids]);

  return (
    <Layout>
      <div className="container py-10">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-extrabold">Mijn favorieten</h1>
            <p className="text-sm text-muted-foreground mt-1">{list.length} bewaarde fietsen</p>
          </div>
          {list.length > 0 && (
            <Button variant="outline" onClick={clear}>Alles verwijderen</Button>
          )}
        </div>

        {list.length === 0 ? (
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
            {list.map((b) => <Link key={b.id} to={`/fiets/${b.id}`}><BikeCard bike={b} /></Link>)}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Favorites;
