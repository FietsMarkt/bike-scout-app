import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Search from "./pages/Search.tsx";
import BikeDetail from "./pages/BikeDetail.tsx";
import PlaceBike from "./pages/PlaceBike.tsx";
import Favorites from "./pages/Favorites.tsx";
import MyBikes from "./pages/MyBikes.tsx";
import Login from "./pages/Login.tsx";
import Messages from "./pages/Messages.tsx";
import Conversation from "./pages/Conversation.tsx";
import SellerProfile from "./pages/SellerProfile.tsx";
import SavedSearches from "./pages/SavedSearches.tsx";
import { Dealers, Magazine, SellGuide } from "./pages/StaticPages.tsx";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, refetchOnWindowFocus: false } },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <FavoritesProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/zoeken" element={<Search />} />
              <Route path="/fiets/:id" element={<BikeDetail />} />
              <Route path="/plaatsen" element={<PlaceBike />} />
              <Route path="/favorieten" element={<Favorites />} />
              <Route path="/mijn-fietsen" element={<MyBikes />} />
              <Route path="/berichten" element={<Messages />} />
              <Route path="/berichten/:id" element={<Conversation />} />
              <Route path="/verkoper/:id" element={<SellerProfile />} />
              <Route path="/zoekopdrachten" element={<SavedSearches />} />
              <Route path="/inloggen" element={<Login />} />
              <Route path="/dealers" element={<Dealers />} />
              <Route path="/magazine" element={<Magazine />} />
              <Route path="/verkopen" element={<SellGuide />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </FavoritesProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
