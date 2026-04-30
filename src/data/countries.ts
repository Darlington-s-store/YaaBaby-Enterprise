/**
 * Hand-curated location data for YaaBaby Enterprise.
 * Focused on core West African markets with localized region names.
 */

export interface LocationData {
  id: string;
  name: string;
  dialCode: string;
  states: {
    name: string;
    code?: string;
  }[];
}

export const COUNTRY_DATA: LocationData[] = [
  {
    id: "ghana",
    name: "Ghana",
    dialCode: "+233",
    states: [
      { name: "Greater Accra" },
      { name: "Ashanti (Kumasi)" },
      { name: "Western (Sekondi-Takoradi)" },
      { name: "Eastern (Koforidua)" },
      { name: "Central (Cape Coast)" },
      { name: "Northern (Tamale)" },
      { name: "Volta (Ho)" },
      { name: "Bono (Sunyani)" },
      { name: "Bono East (Techiman)" },
      { name: "Ahafo (Goaso)" },
      { name: "Western North (Sefwi Wiawso)" },
      { name: "Oti (Dambai)" },
      { name: "Savannah (Damongo)" },
      { name: "North East (Nalerigu)" },
      { name: "Upper East (Bolgatanga)" },
      { name: "Upper West (Wa)" },
    ],
  },
  {
    id: "nigeria",
    name: "Nigeria",
    dialCode: "+234",
    states: [
      { name: "Lagos" },
      { name: "Abuja (FCT)" },
      { name: "Rivers (Port Harcourt)" },
      { name: "Kano" },
      { name: "Oyo (Ibadan)" },
      { name: "Anambra" },
      { name: "Delta" },
      { name: "Edo" },
      { name: "Enugu" },
      { name: "Kaduna" },
      { name: "Ogun" },
    ],
  },
  {
    id: "ivory_coast",
    name: "Côte d'Ivoire",
    dialCode: "+225",
    states: [
      { name: "Abidjan" },
      { name: "Yamoussoukro" },
      { name: "Bas-Sassandra" },
      { name: "Lagunes" },
      { name: "Vallée du Bandama" },
    ],
  },
  {
    id: "togo",
    name: "Togo",
    dialCode: "+228",
    states: [
      { name: "Lomé (Maritime)" },
      { name: "Kara" },
      { name: "Plateaux" },
      { name: "Savanes" },
      { name: "Centrale" },
    ],
  },
  {
    id: "united_kingdom",
    name: "United Kingdom",
    dialCode: "+44",
    states: [
      { name: "England" },
      { name: "Scotland" },
      { name: "Wales" },
      { name: "Northern Ireland" },
    ],
  },
  {
    id: "united_states",
    name: "United States",
    dialCode: "+1",
    states: [
      { name: "California" },
      { name: "New York" },
      { name: "Texas" },
      { name: "Florida" },
      { name: "Georgia" },
      { name: "Maryland" },
    ],
  },
  {
    id: "canada",
    name: "Canada",
    dialCode: "+1",
    states: [
      { name: "Ontario" },
      { name: "Quebec" },
      { name: "British Columbia" },
      { name: "Alberta" },
    ],
  },
];
