import { Layout } from "@/components/Layout";
import { Link } from "react-router-dom";

type Props = { title: string; description: string };

const SimplePage = ({ title, description }: Props) => (
  <Layout>
    <div className="container py-20 text-center max-w-2xl">
      <h1 className="font-display text-4xl font-extrabold">{title}</h1>
      <p className="mt-4 text-muted-foreground">{description}</p>
      <Link to="/" className="inline-block mt-6 text-primary font-semibold hover:underline">← Terug naar home</Link>
    </div>
  </Layout>
);

export const Dealers = () => <SimplePage title="Geverifieerde dealers" description="Hier komt binnenkort een overzicht van 1.200+ erkende fietswinkels in de Benelux." />;
export const Magazine = () => <SimplePage title="Magazine" description="Tips, reviews en verhalen uit de fietswereld. Binnenkort live." />;
export const SellGuide = () => <SimplePage title="Fiets verkopen" description="Stap-voor-stap gids om je fiets snel en veilig te verkopen." />;
