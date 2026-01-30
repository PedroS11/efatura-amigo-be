import { Categories } from "../../companiesTable/types";

export const EXACT_CAE_MAP: Record<string, Categories> = {
  // Saude
  "47730": Categories.Saude,
  "47740": Categories.Saude,
  "47781": Categories.Saude,
  "47782": Categories.Saude,
  // Educacao
  "88910": Categories.Educacao,
  "80100": Categories.Educacao,
  // Ginasio
  "93110": Categories.Ginasio,
  "93120": Categories.Ginasio,
  "93130": Categories.Ginasio,
  // Reparações
  "45402": Categories["Reparacao Motas"],
  // Imoveis
  "68200": Categories.Imoveis,
  // Jornais
  "47620": Categories["Jornais e Revista"],
  "58130": Categories["Jornais e Revista"],
  "58140": Categories["Jornais e Revista"],
  // Outros
  "47711": Categories.Outros, // Clothing & Footwear
  "47721": Categories.Outros, // Clothing & Footwear
  "47300": Categories.Outros, // Fuel
  "47521": Categories.Outros, // Hardware, Appliances, Furniture, Tech
  "47540": Categories.Outros, // Hardware, Appliances, Furniture, Tech
  "47591": Categories.Outros, // Hardware, Appliances, Furniture, Tech
  "47410": Categories.Outros, // Hardware, Appliances, Furniture, Tech
  "35141": Categories.Outros, // Utilities (Electricity, Gas, Water)
  "35230": Categories.Outros, // Utilities (Electricity, Gas, Water)
  "36002": Categories.Outros, // Utilities (Electricity, Gas, Water)
  "61100": Categories.Outros, // Telecoms
  "61200": Categories.Outros // Telecoms
};

export const PREFIX_CAE_MAP: Record<string, Categories> = {
  "9602": Categories.Cabeleireiro,
  "750": Categories["Animais de Estimacao"],
  "471": Categories.Outros, // Supermarkets
  "452": Categories["Reparacao Automovel"],
  "87": Categories.Lares,
  "86": Categories.Saude,
  "85": Categories.Educacao,
  "56": Categories["Alimentacao/Hotelaria"],
  "55": Categories["Alimentacao/Hotelaria"],
  "51": Categories.Transportes,
  "50": Categories.Transportes,
  "49": Categories.Transportes,
  "10": Categories["Alimentacao/Hotelaria"] //  Indústrias alimentares
};
