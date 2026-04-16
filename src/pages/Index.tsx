import { Hero } from "@/components/Hero";
import { Categories } from "@/components/Categories";
import { FeaturedListings } from "@/components/FeaturedListings";
import { TrustBar } from "@/components/TrustBar";
import { Layout } from "@/components/Layout";
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
  }, []);

  return (
    <Layout>
      <Hero />
      <Categories />
      <FeaturedListings />
      <TrustBar />
    </Layout>
  );
};

export default Index;
