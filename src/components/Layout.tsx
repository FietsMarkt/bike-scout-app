import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AppHeader } from "@/components/AppHeader";
import { BottomTabBar } from "@/components/BottomTabBar";
import { useStandalone } from "@/hooks/useStandalone";
import { ReactNode } from "react";

export const Layout = ({ children }: { children: ReactNode }) => {
  const isApp = useStandalone();

  if (isApp) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <AppHeader />
        <main className="flex-1 pb-20">{children}</main>
        <BottomTabBar />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};
