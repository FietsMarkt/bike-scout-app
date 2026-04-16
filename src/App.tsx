import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Search from "./pages/Search.tsx";
import BikeDetail from "./pages/BikeDetail.tsx";
import PlaceBike from "./pages/PlaceBike.tsx";
import Favorites from "./pages/Favorites.tsx";
import Login from "./pages/Login.tsx";
import { Dealers, Magazine, SellGuide } from "./pages/StaticPages.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <FavoritesProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/zoeken" element={<Search />} />
            <Route path="/fiets/:id" element={<BikeDetail />} />
            <Route path="/plaatsen" element={<PlaceBike />} />
            <Route path="/favorieten" element={<Favorites />} />
            <Route path="/inloggen" element={<Login />} />
            <Route path="/dealers" element={<Dealers />} />
            <Route path="/magazine" element={<Magazine />} />
            <Route path="/verkopen" element={<SellGuide />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </FavoritesProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
