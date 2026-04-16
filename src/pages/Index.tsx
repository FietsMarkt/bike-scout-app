import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Categories } from "@/components/Categories";
import { FeaturedListings } from "@/components/FeaturedListings";
import { TrustBar } from "@/components/TrustBar";
import { Footer } from "@/components/Footer";
import { useEffect } from "react";

const Index = () => {
  useEffect(() => {
    document.title = "FietsMarkt — Koop & verkoop fietsen | Nº 1 fietsenmarktplaats";
    const meta =
      document.querySelector('meta[name="description"]') ||
      Object.assign(document.createElement("meta"), { name: "description" });
    meta.setAttribute(
      "content",
      "Vind nieuwe en gebruikte fietsen: racefietsen, e-bikes, MTB, gravel en meer. 84.000+ advertenties van particulieren en dealers.",
    );
    document.head.appendChild(meta);

    const canonical =
      document.querySelector('link[rel="canonical"]') ||
      Object.assign(document.createElement("link"), { rel: "canonical" });
    canonical.setAttribute("href", window.location.origin + "/");
    document.head.appendChild(canonical);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main>
        <Hero />
        <Categories />
        <FeaturedListings />
        <TrustBar />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
