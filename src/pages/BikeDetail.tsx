import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Heart, MapPin, Calendar, Gauge, Zap, Share2, ShieldCheck, Mail, ChevronLeft, CheckCircle2, Store,
} from "lucide-react";
import { useBike, useSellerProfile } from "@/hooks/useBikes";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getOrCreateConversation } from "@/lib/chat";
import { getOptimizedImage } from "@/lib/image";
import { AppBikeDetail } from "@/components/AppBikeDetail";

const fmt = new Intl.NumberFormat("nl-BE");

const BikeDetail = () => {
  const { id } = useParams();
  const nav = useNavigate();
  const { toast } = useToast();
  const fav = useFavorites();
  const { user } = useAuth();
  const { data: res, isLoading } = useBike(id);
  const bike = res?.bike;
  const raw = res?.raw;
  const sellerId = (raw?.user_id as string | undefined);
  const { data: seller } = useSellerProfile(sellerId);
  const sellerName = seller?.display_name ?? "Verkoper";
  const [activeImage, setActiveImage] = useState(0);
  const [contacting, setContacting] = useState(false);

  useEffect(() => { if (bike) document.title = `${bike.title} | FietsMarkt`; }, [bike]);

  return <Layout><AppBikeDetail /></Layout>;

};

export default BikeDetail;
