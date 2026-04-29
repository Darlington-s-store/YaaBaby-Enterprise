// Lightweight country + region list (focused on West Africa + globals)
export type Country = { code: string; name: string; regions: string[] };

export const countries: Country[] = [
  {
    code: "GH",
    name: "Ghana 🇬🇭",
    regions: [
      "Greater Accra", "Ashanti", "Western", "Eastern", "Central",
      "Northern", "Volta", "Bono", "Bono East", "Ahafo",
      "Western North", "Oti", "Savannah", "North East", "Upper East", "Upper West",
    ],
  },
  {
    code: "NG",
    name: "Nigeria 🇳🇬",
    regions: ["Lagos", "Abuja FCT", "Rivers", "Kano", "Oyo", "Kaduna", "Enugu", "Edo", "Delta", "Anambra"],
  },
  { code: "CI", name: "Côte d'Ivoire 🇨🇮", regions: ["Abidjan", "Yamoussoukro", "Bouaké", "San-Pédro"] },
  { code: "TG", name: "Togo 🇹🇬", regions: ["Maritime", "Plateaux", "Centrale", "Kara", "Savanes"] },
  { code: "SN", name: "Senegal 🇸🇳", regions: ["Dakar", "Thiès", "Saint-Louis", "Kaolack"] },
  { code: "KE", name: "Kenya 🇰🇪", regions: ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret"] },
  { code: "ZA", name: "South Africa 🇿🇦", regions: ["Gauteng", "Western Cape", "KwaZulu-Natal", "Eastern Cape"] },
  { code: "GB", name: "United Kingdom 🇬🇧", regions: ["England", "Scotland", "Wales", "Northern Ireland"] },
  { code: "US", name: "United States 🇺🇸", regions: ["California", "Texas", "New York", "Florida", "Other"] },
  { code: "OTHER", name: "Other", regions: ["Other"] },
];
