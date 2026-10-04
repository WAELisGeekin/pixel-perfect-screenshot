import p1 from "@/assets/p1.jpg";
import p2 from "@/assets/p2.jpg";
import p3 from "@/assets/p3.jpg";
import p4 from "@/assets/p4.jpg";

export type PType = "apartment" | "villa" | "house" | "duplex";

export type Property = {
  id: string;
  title: { fr: string; ar: string };
  city: { fr: string; ar: string };
  type: PType;
  price: number; // DZD
  beds: number;
  baths: number;
  area: number;
  lat: number;
  lng: number;
  images: string[];
  has360: boolean;
  amenities: string[];
  description: { fr: string; ar: string };
};

export const agent = {
  name: "Yasmine Benali",
  agency: "FAZTI Immobilier Oran",
  phone: "+213 550 12 34 56",
  initials: "YB",
};

const g = (a: string, b: string, c: string, d: string) => [a, b, c, d];

export const properties: Property[] = [
  { id: "villa-canastel", type: "villa", price: 85000000, beds: 5, baths: 4, area: 420, lat: 35.7425, lng: -0.5764, has360: true,
    title: { fr: "Villa vue mer avec piscine", ar: "فيلا مطلة على البحر مع مسبح" },
    city: { fr: "Canastel, Oran", ar: "كناستيل، وهران" },
    images: g(p1, p2, p4, p3), amenities: ["pool", "parking", "garden", "ac", "security", "seaview"],
    description: { fr: "Villa contemporaine sur les hauteurs de Canastel, terrasse panoramique et piscine à débordement face à la baie d'Oran.", ar: "فيلا عصرية في أعالي كناستيل، مع شرفة بانورامية ومسبح مطل على خليج وهران." } },
  { id: "f4-hydra", type: "apartment", price: 32000000, beds: 3, baths: 2, area: 145, lat: 36.7406, lng: 3.0336, has360: true,
    title: { fr: "F4 lumineux vue sur la baie", ar: "شقة F4 مشمسة مطلة على الخليج" },
    city: { fr: "Hydra, Alger", ar: "حيدرة، الجزائر" },
    images: g(p2, p4, p1, p3), amenities: ["elevator", "parking", "ac", "security", "seaview"],
    description: { fr: "Appartement haut standing au 8e étage, résidence sécurisée, à deux pas des ambassades.", ar: "شقة راقية في الطابق الثامن، إقامة محروسة قرب السفارات." } },
  { id: "dar-casbah", type: "house", price: 48000000, beds: 6, baths: 3, area: 310, lat: 36.7853, lng: 3.0603, has360: false,
    title: { fr: "Dar traditionnelle rénovée", ar: "دار تقليدية مرممة" },
    city: { fr: "Casbah, Alger", ar: "القصبة، الجزائر" },
    images: g(p3, p1, p2, p4), amenities: ["garden", "terrace", "heritage"],
    description: { fr: "Maison ottomane restaurée avec patio, zellige d'origine et fontaine centrale.", ar: "دار عثمانية مرممة بفناء وزليج أصلي ونافورة." } },
  { id: "duplex-constantine", type: "duplex", price: 26500000, beds: 3, baths: 2, area: 160, lat: 36.365, lng: 6.6147, has360: true,
    title: { fr: "Duplex neuf face aux ponts", ar: "دوبلكس جديد مقابل الجسور" },
    city: { fr: "Sidi Mabrouk, Constantine", ar: "سيدي مبروك، قسنطينة" },
    images: g(p4, p2, p3, p1), amenities: ["elevator", "parking", "ac", "terrace"],
    description: { fr: "Duplex moderne avec vue imprenable sur le pont Sidi M'Cid.", ar: "دوبلكس عصري بإطلالة رائعة على جسر سيدي مسيد." } },
  { id: "f3-ain-temouchent", type: "apartment", price: 12500000, beds: 2, baths: 1, area: 92, lat: 35.2974, lng: -1.1404, has360: false,
    title: { fr: "F3 en centre-ville", ar: "شقة F3 وسط المدينة" },
    city: { fr: "Aïn Témouchent", ar: "عين تموشنت" },
    images: g(p2, p1, p4, p3), amenities: ["elevator", "parking"],
    description: { fr: "Appartement rénové proche commerces et écoles.", ar: "شقة مجددة قرب المحلات والمدارس." } },
  { id: "villa-bousfer", type: "villa", price: 54000000, beds: 4, baths: 3, area: 280, lat: 35.7186, lng: -0.8045, has360: true,
    title: { fr: "Villa pieds dans l'eau", ar: "فيلا على شاطئ البحر" },
    city: { fr: "Bousfer, Oran", ar: "بوسفر، وهران" },
    images: g(p1, p3, p2, p4), amenities: ["pool", "garden", "seaview", "parking"],
    description: { fr: "Villa balnéaire avec accès direct à la plage.", ar: "فيلا ساحلية بمدخل مباشر إلى الشاطئ." } },
  { id: "f5-akid-lotfi", type: "apartment", price: 38000000, beds: 4, baths: 2, area: 175, lat: 35.7128, lng: -0.5873, has360: true,
    title: { fr: "F5 standing Akid Lotfi", ar: "شقة F5 راقية بحي العقيد لطفي" },
    city: { fr: "Akid Lotfi, Oran", ar: "العقيد لطفي، وهران" },
    images: g(p2, p4, p3, p1), amenities: ["elevator", "parking", "ac", "security"],
    description: { fr: "Grand appartement familial, résidence avec gardiennage 24/7.", ar: "شقة عائلية واسعة في إقامة محروسة على مدار الساعة." } },
  { id: "maison-tlemcen", type: "house", price: 21000000, beds: 4, baths: 2, area: 220, lat: 34.8783, lng: -1.315, has360: false,
    title: { fr: "Maison avec jardin", ar: "منزل مع حديقة" },
    city: { fr: "Imama, Tlemcen", ar: "إمامة، تلمسان" },
    images: g(p3, p4, p1, p2), amenities: ["garden", "parking", "terrace"],
    description: { fr: "Maison individuelle R+1 avec jardin arboré.", ar: "منزل فردي من طابقين مع حديقة مشجرة." } },
];

export const amenityLabels: Record<string, { fr: string; ar: string }> = {
  pool: { fr: "Piscine", ar: "مسبح" }, parking: { fr: "Parking", ar: "موقف" },
  garden: { fr: "Jardin", ar: "حديقة" }, ac: { fr: "Climatisation", ar: "تكييف" },
  security: { fr: "Sécurité 24/7", ar: "حراسة" }, seaview: { fr: "Vue mer", ar: "إطلالة بحرية" },
  elevator: { fr: "Ascenseur", ar: "مصعد" }, terrace: { fr: "Terrasse", ar: "شرفة" },
  heritage: { fr: "Patrimoine", ar: "تراث" },
};
