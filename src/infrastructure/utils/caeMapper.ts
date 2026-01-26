import { Categories } from "../companiesTable/types";

export const mapCaeToCategory = (cae: number): Categories | undefined => {
  // Normalize to string to handle prefixes easily (standard CAE is 5 digits)
  // We use padStart to ensure "123" becomes "00123" if necessary, though CAEs are usually >1000
  const caeStr = cae.toString().padStart(5, "0");

  // --- 1. HEALTH (Saúde) ---
  // Section Q (86) and specific Retail of medical goods (4773, 4774)
  if (caeStr.startsWith("86")) return Categories["Saude"]; // Human health activities
  if (["47730", "47740", "47781", "47782"].includes(caeStr)) return Categories["Saude"]; // Pharmacies, Medical goods, Glasses, Hearing aids

  // --- 2. EDUCATION (Educação) ---
  // Section P (85) and specific tutors/childcare
  if (caeStr.startsWith("85")) return Categories["Educacao"]; // Education
  if (["80100", "80110", "80120", "80130", "88910"].includes(caeStr)) return Categories["Educacao"]; // Tutors, Childcare

  // --- 3. RESTAURANTS & HOTELS (Alimentação/Hotelaria) ---
  // Section I (55 and 56)
  if (caeStr.startsWith("55") || caeStr.startsWith("56")) return Categories["Alimentacao/Hotelaria"];

  // --- 4. CAR REPAIR (Reparação Automóvel) ---
  // 45200: Maintenance and repair of motor vehicles
  if (caeStr.startsWith("452")) return Categories["Reparacao Automovel"];
  if ("45110".includes(caeStr)) return Categories["Reparacao Automovel"];

  // --- 5. MOTORCYCLE REPAIR (Reparação Motas) ---
  // 45402: Maintenance and repair of motorcycles
  if (caeStr === "45402") return Categories["Reparacao Motas"];

  // --- 6. HAIRDRESSERS (Cabeleireiro) ---
  // 96021 (Hair) and 96022 (Beauty)
  if (caeStr.startsWith("9602")) return Categories["Cabeleireiro"];

  // --- 7. VETERINARY (Animais de Estimação) ---
  // 75000: Veterinary activities
  if (caeStr.startsWith("750")) return Categories["Animais de Estimacao"];

  // --- 8. GYMS (Ginásio) ---
  // 93110, 93120, 93130 are the main ones accepted for VAT deduction
  if (["93110", "93120", "93130"].includes(caeStr)) return Categories["Ginasio"];

  // --- 9. HOMES (Lares) ---
  // Section Q (87): Residential care activities
  if (caeStr.startsWith("87")) return Categories["Lares"];

  // --- 10. TRANSPORT (Transportes / Passes) ---
  // Section H (49, 50, 51) - Land, Water, Air transport
  if (caeStr.startsWith("49") || caeStr.startsWith("50") || caeStr.startsWith("51")) return Categories["Transportes"];

  // --- 11. NEWSPAPERS (Jornais e Revistas) ---
  // Retail sale of newspapers (47620) or Publishing (5813, 5814)
  if (["47620", "58130", "58140"].includes(caeStr)) return Categories["Jornais e Revista"];

  // --- 12. HOUSING (Imóveis) ---
  // 68200: Renting and operating of own or leased real estate
  // (Note: This is for Rents. Interest is bank-related and doesn't map via CAE usually)
  if (caeStr === "68200") return Categories["Imoveis"];

  // --- 13. GENERAL / OTHERS (Outros) ---
  // Supermarkets (47111) and Retail of clothing/etc fall here.
  // If you want to default specific huge sectors to "Outros" explicitly:
  if (caeStr.startsWith("471")) return Categories["Outros"]; // Supermarkets/General retail
  if (["47711"].includes(caeStr)) return Categories["Outros"];

  // If no match found
  return undefined;
};
