// Default taxonomy seed (used by useTaxonomyStore on first load).
// Admin can add/edit/delete from /admin/categories.

export type Brand = { id: string; name: string };
export type Subcategory = { id: string; name: string; brands: Brand[] };
export type Category = {
  id: string;
  name: string;
  icon: string;
  subcategories: Subcategory[];
};

const b = (...names: string[]): Brand[] =>
  names.map((n) => ({ id: n.toLowerCase().replace(/[^a-z0-9]+/g, "-"), name: n }));

export const defaultCategories: Category[] = [
  {
    id: "electronics",
    name: "Electronics",
    icon: "📱",
    subcategories: [
      { id: "laptops", name: "Laptops", brands: b("Lenovo", "MacBook", "HP", "Dell", "ASUS", "Alienware", "Razer Blade", "MSI", "Acer") },
      { id: "smartphones", name: "Smartphones", brands: b("Apple", "Samsung", "Google Pixel", "Tecno", "Itel", "Infinix", "Xiaomi", "OPPO") },
      { id: "networking", name: "Networking", brands: b("TP-Link", "Huawei MiFi", "Netgear", "MTN Router", "Vodafone MiFi", "Cisco") },
      { id: "accessories", name: "Computer Accessories", brands: b("Logitech", "Anker", "HP", "Dell", "Razer", "Microsoft", "Generic") },
      { id: "audio", name: "Audio & Headphones", brands: b("Sony", "JBL", "Bose", "Apple", "Beats", "Anker Soundcore") },
      { id: "tvs", name: "TVs & Displays", brands: b("Samsung", "LG", "Hisense", "Sony", "TCL", "Nasco") },
    ],
  },
  {
    id: "home-appliances",
    name: "Home Appliances",
    icon: "🏠",
    subcategories: [
      { id: "kitchen", name: "Kitchen Appliances", brands: b("Binatone", "Philips", "Kenwood", "Tefal", "Black+Decker", "Nasco") },
      { id: "cooking", name: "Cooking & Cylinders", brands: b("Rinnai", "Nasco", "Bruhm", "Indesit") },
      { id: "rice-cookers", name: "Rice Cookers & Microwaves", brands: b("Binatone", "Philips", "Panasonic", "Sharp", "LG") },
      { id: "blenders", name: "Blenders & Mixers", brands: b("Binatone", "Kenwood", "Philips", "Moulinex") },
      { id: "kitchen-tools", name: "Kitchen Tools", brands: b("Tefal", "Pyrex", "Generic") },
      { id: "laundry", name: "Laundry & Cleaning", brands: b("LG", "Samsung", "Bruhm", "Hisense") },
    ],
  },
  {
    id: "fashion",
    name: "Fashion",
    icon: "👕",
    subcategories: [
      { id: "men", name: "Men's Fashion", brands: b("Nike", "Adidas", "Polo", "Tommy Hilfiger", "Local Tailor") },
      { id: "women", name: "Women's Fashion", brands: b("Zara", "H&M", "Local Designer", "Kente Co.") },
      { id: "shoes", name: "Shoes", brands: b("Nike", "Adidas", "Puma", "Vellum", "Clarks") },
      { id: "bags", name: "Bags", brands: b("Michael Kors", "Coach", "Local Brand") },
    ],
  },
  {
    id: "beauty",
    name: "Beauty & Fragrance",
    icon: "💄",
    subcategories: [
      { id: "fragrance", name: "Fragrances", brands: b("Maison Yaa", "Dior", "Chanel", "Tom Ford", "YSL") },
      { id: "skincare", name: "Skincare", brands: b("Cerave", "The Ordinary", "L'Oréal", "Nivea") },
      { id: "makeup", name: "Makeup", brands: b("MAC", "Fenty Beauty", "Maybelline", "L'Oréal") },
      { id: "haircare", name: "Hair Care", brands: b("Cantu", "Shea Moisture", "ORS", "Dark & Lovely") },
    ],
  },
  {
    id: "sports",
    name: "Sports & Outdoor",
    icon: "⚽",
    subcategories: [
      { id: "fitness", name: "Fitness Equipment", brands: b("Domyos", "Adidas", "Generic") },
      { id: "footballs", name: "Football & Team Sports", brands: b("Nike", "Adidas", "Puma") },
      { id: "outdoor", name: "Outdoor & Camping", brands: b("Quechua", "Generic") },
    ],
  },
];
