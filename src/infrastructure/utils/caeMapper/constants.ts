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
  // Oficina Automoveis
  "45310": Categories["Reparacao Automovel"],
  "45320": Categories["Reparacao Automovel"],
  // Reparações
  "45401": Categories["Reparacao Motas"],
  "45402": Categories["Reparacao Motas"],
  // Imoveis
  "68200": Categories.Imoveis,
  // Jornais
  "47620": Categories["Jornais e Revista"],
  "58130": Categories["Jornais e Revista"],
  "58140": Categories["Jornais e Revista"],
  // Restauração
  "47240": Categories["Alimentacao/Hotelaria"],
  // Outros
  "47711": Categories.Outros, // Clothing & Footwear
  "47721": Categories.Outros, // Clothing & Footwear
  "47712": Categories.Outros, // Vestuário para bebés e crianças
  "47300": Categories.Outros, // Fuel
  "46811": Categories.Outros, // Fuel
  "19201": Categories.Outros, // Fabricação de produtos petrolíferos refinados
  "46711": Categories.Outros, // Produtos petrolíferos
  "47521": Categories.Outros, // Hardware, Appliances, Furniture, Tech
  "47540": Categories.Outros, // Hardware, Appliances, Furniture, Tech
  "47591": Categories.Outros, // Hardware, Appliances, Furniture, Tech
  "47410": Categories.Outros, // Hardware, Appliances, Furniture, Tech
  "82190": Categories.Outros, // Execução de fotocópias, preparação de documentos e outras actividades especializadas de apoio administrativo
  "35141": Categories.Outros, // Utilities (Electricity, Gas, Water)
  "35230": Categories.Outros, // Utilities (Electricity, Gas, Water)
  "36002": Categories.Outros, // Utilities (Electricity, Gas, Water)
  "61100": Categories.Outros, // Telecoms
  "61200": Categories.Outros, // Telecoms
  "52211": Categories.Outros, //  Gestão de infraestruturas dos transportes terrestres,
  "47191": Categories.Outros, // Comércio a retalho em grandes armazéns e similares
  "47750": Categories.Outros, // Comércio a retalho de produtos cosméticos e de higiene
  "46900": Categories.Outros, // Comércio por grosso não especializado
  "46390": Categories.Outros, // Comércio por grosso não especializado de produtos alimentares, bebidas e tabaco
  "81100": Categories.Outros // Atividades combinadas de apoio aos edifícios
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
