import type { Bike } from "@/components/BikeCard";
import bike1 from "@/assets/bike-1.jpg";
import bike2 from "@/assets/bike-2.jpg";
import bike3 from "@/assets/bike-3.jpg";
import bike4 from "@/assets/bike-4.jpg";
import bike5 from "@/assets/bike-5.jpg";
import bike6 from "@/assets/bike-6.jpg";
import bike7 from "@/assets/bike-7.jpg";
import bike8 from "@/assets/bike-8.jpg";

export const bikes: Bike[] = [
  {
    id: "1",
    title: "Trek Domane SLR 7 eTap",
    subtitle: "Carbon racefiets · SRAM Force AXS",
    price: 6450, year: 2023, km: 1200,
    location: "Amsterdam, NH",
    image: bike1,
    badge: "Topdeal", dealer: true,
  },
  {
    id: "2",
    title: "Specialized Turbo Vado 5.0",
    subtitle: "E-bike · 710Wh · Riemaandrijving",
    price: 4290, year: 2024, km: 340, motor: "Bosch CX",
    location: "Utrecht, UT",
    image: bike2,
    dealer: true,
  },
  {
    id: "3",
    title: "Canyon Spectral CF 8",
    subtitle: "Full-suspension MTB · 29\" · GX Eagle",
    price: 3850, year: 2022, km: 2100,
    location: "Eindhoven, NB",
    image: bike3,
    badge: "Nieuw binnen",
  },
  {
    id: "4",
    title: "Stromer ST3",
    subtitle: "Speed pedelec · 45 km/u · 983Wh",
    price: 7990, year: 2023, km: 5400, motor: "Cyro Drive",
    location: "Rotterdam, ZH",
    image: bike4,
    dealer: true,
  },
  {
    id: "5",
    title: "Bianchi Oltre RC",
    subtitle: "Aero racefiets · Dura-Ace Di2",
    price: 11250, year: 2024, km: 600,
    location: "Den Haag, ZH",
    image: bike5,
    badge: "Premium",
  },
  {
    id: "6",
    title: "Riese & Müller Load 75",
    subtitle: "Bakfiets · Bosch Performance · Dual Battery",
    price: 8990, year: 2023, km: 1800, motor: "Bosch CX",
    location: "Groningen, GR",
    image: bike6,
    dealer: true,
  },
  {
    id: "7",
    title: "Cube Nuroad C:62 Pro",
    subtitle: "Gravel · Carbon · GRX 820",
    price: 2790, year: 2024, km: 150,
    location: "Tilburg, NB",
    image: bike7,
    badge: "Nieuw",
  },
  {
    id: "8",
    title: "Brompton P Line Urban",
    subtitle: "Vouwfiets · Titanium · 4-speed",
    price: 2350, year: 2023, km: 800,
    location: "Haarlem, NH",
    image: bike8,
  },
];
