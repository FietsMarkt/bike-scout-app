import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { BikeCard, type Bike } from "@/components/BikeCard";
import { BikeGridSkeleton } from "@/components/BikeCardSkeleton";
import { useSellerProfile, useSellerBikes } from "@/hooks/useBikes";
import { MapPin, Calendar, Store, User } from "lucide-react";

const SellerProfile = () => {
  const { id } = useParams();
  const { data: profile, isLoading: profileLoading } = useSellerProfile(id);
  const { data: bikes, isLoading: bikesLoading } = useSellerBikes(id);
  const activeBikes = (bikes ?? []) as Bike[];

  useEffect(() => {
    document.title = profile?.display_name ? `${profile.display_name} | FietsMarkt` : "Verkoper | FietsMarkt";
  }, [profile]);

  if (profileLoading) return <Layout><div className="container py-20 text-center text-muted-foreground">Laden…</div></Layout>;

  if (!profile) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <h1 className="font-display text-2xl font-bold">Verkoper niet gevonden</h1>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-surface border-b border-border">
        <div className="container py-10 flex items-start gap-5 flex-wrap">
          <div className="grid h-20 w-20 place-items-center rounded-full bg-gradient-indigo text-white text-2xl font-bold overflow-hidden">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.display_name ?? "Verkoper"} className="h-full w-full object-cover" />
            ) : (
              (profile.display_name ?? "?").charAt(0).toUpperCase()
            )}
          </div>
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2">
              <h1 className="font-display text-3xl font-extrabold">{profile.display_name ?? "Verkoper"}</h1>
              {profile.is_dealer && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary text-primary-foreground px-2.5 py-0.5 text-xs font-bold">
                  <Store className="h-3 w-3" /> Dealer
                </span>
              )}
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
              {profile.city && <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" /> {profile.city}</span>}
              {profile.created_at && (
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-4 w-4" /> Lid sinds {new Date(profile.created_at).toLocaleDateString("nl-BE", { month: "long", year: "numeric" })}
                </span>
              )}
              <span className="inline-flex items-center gap-1"><User className="h-4 w-4" /> {activeBikes.length} advertenties</span>
            </div>
            {profile.bio && <p className="mt-3 text-sm text-foreground max-w-2xl">{profile.bio}</p>}
          </div>
        </div>
      </div>

      <div className="container py-10">
        <h2 className="font-display text-2xl font-bold mb-6">Advertenties</h2>
        {bikesLoading ? (
          <BikeGridSkeleton count={4} />
        ) : activeBikes.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border rounded-xl text-muted-foreground">
            Deze verkoper heeft momenteel geen advertenties.
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {activeBikes.map((b) => <Link key={b.id} to={`/fiets/${b.id}`}><BikeCard bike={b} /></Link>)}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SellerProfile;
