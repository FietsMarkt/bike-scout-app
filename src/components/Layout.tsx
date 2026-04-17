import { BottomTabBar } from "@/components/BottomTabBar";
import { ReactNode } from "react";

export const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="dark min-h-screen flex flex-col bg-background text-foreground">
      <main className="flex-1 pb-24">{children}</main>
      <BottomTabBar />
    </div>
  );
};
