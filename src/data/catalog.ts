import headphones from "@/assets/p-headphones.jpg";
import perfume from "@/assets/p-perfume.jpg";
import watch from "@/assets/p-watch.jpg";
import wallet from "@/assets/p-wallet.jpg";
import sneakers from "@/assets/p-sneakers.jpg";
import sunglasses from "@/assets/p-sunglasses.jpg";
import phone from "@/assets/p-phone.jpg";
import candle from "@/assets/p-candle.jpg";

export type Product = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  compareAt?: number;
  image: string;
  images: string[];
  rating: number;
  reviews: number;
  stock: number;
  description: string;
  badges?: string[];
  createdAt?: string;
  updatedAt?: string;
  colors?: string[];
  sizes?: string[];
};

export type Category = { id: string; name: string; icon: string; count: number };

export const categories: Category[] = [
  { id: "electronics", name: "Electronics", icon: "📱", count: 248 },
  { id: "fashion", name: "Fashion", icon: "👕", count: 412 },
  { id: "beauty", name: "Beauty & Fragrance", icon: "💄", count: 187 },
  { id: "home", name: "Home & Living", icon: "🏠", count: 165 },
  { id: "accessories", name: "Accessories", icon: "👜", count: 298 },
  { id: "sports", name: "Sports & Outdoor", icon: "⚽", count: 134 },
];

export const products: Product[] = [
  {
    id: "1", slug: "nova-wireless-headphones", name: "Nova Wireless Headphones",
    brand: "Aurix", category: "electronics", price: 850, compareAt: 1200,
    rating: 4.8, reviews: 412, image: headphones, images: [headphones],
    badges: ["Best Seller", "-29%"], stock: 24,
    description: "Studio-grade active noise cancellation with 40 hours of battery life. Plush memory-foam cushions and signature gold-trim accents.",
    colors: ["Onyx", "Gold", "Cream"],
  },
  {
    id: "2", slug: "lumière-eau-de-parfum", name: "Lumière Eau de Parfum",
    brand: "Maison Yaa", category: "beauty", price: 420, compareAt: 520,
    rating: 4.9, reviews: 289, image: perfume, images: [perfume],
    badges: ["New"], stock: 56,
    description: "An amber-vanilla signature with notes of bergamot, oud, and warm musk. 100ml.",
  },
  {
    id: "3", slug: "regent-gold-watch", name: "Regent Gold Watch",
    brand: "Calcols", category: "accessories", price: 1850, compareAt: 2400,
    rating: 4.7, reviews: 156, image: watch, images: [watch],
    badges: ["Premium", "-23%"], stock: 8,
    description: "Hand-finished gold-plated case with genuine leather strap. Sapphire crystal, 5 ATM water resistance.",
  },
  {
    id: "4", slug: "everyday-leather-wallet", name: "Everyday Leather Wallet",
    brand: "Kente Co.", category: "accessories", price: 220,
    rating: 4.6, reviews: 521, image: wallet, images: [wallet], stock: 132,
    description: "Full-grain tan leather, six card slots, RFID-blocking lining.",
    colors: ["Tan", "Cocoa", "Black"],
  },
  {
    id: "5", slug: "stride-gold-runners", name: "Stride Gold Runners",
    brand: "Vellum", category: "sports", price: 540, compareAt: 720,
    rating: 4.5, reviews: 203, image: sneakers, images: [sneakers],
    badges: ["-25%"], stock: 41,
    description: "Lightweight mesh upper with responsive foam midsole and signature gold heel pop.",
    sizes: ["38", "39", "40", "41", "42", "43", "44"],
  },
  {
    id: "6", slug: "noir-aviator-eyewear", name: "Noir Aviator Eyewear",
    brand: "Solis", category: "fashion", price: 280,
    rating: 4.4, reviews: 98, image: sunglasses, images: [sunglasses],
    badges: ["New"], stock: 67,
    description: "Polarized UV400 lenses, lightweight titanium frame, signature case included.",
  },
  {
    id: "7", slug: "atlas-pro-smartphone", name: "Atlas Pro Smartphone",
    brand: "Atlas", category: "electronics", price: 4200, compareAt: 4800,
    rating: 4.7, reviews: 612, image: phone, images: [phone],
    badges: ["Top Rated"], stock: 12,
    description: "6.7\" AMOLED, 256GB storage, triple-lens 50MP camera, 5000mAh battery.",
    colors: ["Graphite", "Cream", "Emerald"],
  },
  {
    id: "8", slug: "warm-amber-soy-candle", name: "Warm Amber Soy Candle",
    brand: "Maison Yaa", category: "home", price: 110,
    rating: 4.8, reviews: 344, image: candle, images: [candle], stock: 89,
    description: "Hand-poured soy wax with warm amber, sandalwood, and tonka bean. 50-hour burn time.",
  },
];

export const heroSlides = [
  { eyebrow: "Yaa Baby Ent.", title: "Everything you love.\nIn one storefront.", subtitle: "Electronics, fashion, beauty, and home — curated, authenticated, delivered across Ghana.", cta: "Shop the edit", href: "/shop" },
  { eyebrow: "Flash sale · Ends in 24h", title: "Up to 40% off\nfestive picks.", subtitle: "Trending bestsellers, lightning-fast checkout via Paystack.", cta: "See deals", href: "/shop?sale=true" },
  { eyebrow: "New In", title: "Maison Yaa fragrances\nhave landed.", subtitle: "An amber-vanilla signature with notes of bergamot, oud, and warm musk.", cta: "Discover", href: "/product/lumière-eau-de-parfum" },
];

export const stats = [
  { value: "500+", label: "Happy customers" },
  { value: "1K+", label: "Products curated" },
  { value: "4.8★", label: "Average rating" },
  { value: "24h", label: "Fast delivery" },
];

export const testimonials: { name: string; role: string; quote: string; rating: number }[] = [];
