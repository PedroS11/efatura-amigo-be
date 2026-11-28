import { Categories } from "../../../companiesTable/types";
import type { CAEMapper } from "../index";

export const EXACT_CAE_REV4_MAP: CAEMapper = {
  // Saúde
  "47730": Categories.Saude,
  "47740": Categories.Saude, // ophthalmic/optical retail

  // Educação
  "88910": Categories.Educacao,

  // Ginásio
  "93110": Categories.Ginasio,
  "93120": Categories.Ginasio,
  "93130": Categories.Ginasio,

  // Oficina Automóveis (moved from Div 45)
  "95310": Categories["Reparacao Automovel"], // Reparação e manutenção de veículos automóveis
  "46720": Categories["Reparacao Automovel"], // Comércio por grosso de peças e acessórios
  "47820": Categories["Reparacao Automovel"], // Comércio a retalho de peças e acessórios

  // Reparação Motas (moved from Div 45)
  "95320": Categories["Reparacao Motas"], // Reparação e manutenção de motociclos
  "46730": Categories["Reparacao Motas"], // Comércio por grosso de motociclos, partes e acessórios
  "47830": Categories["Reparacao Motas"], // Comércio a retalho de motociclos, partes e acessórios

  // Imóveis
  "68200": Categories.Imoveis,

  // Jornais e Revistas
  "47621": Categories["Jornais e Revista"],
  "58120": Categories["Jornais e Revista"], // Edição de jornais (was 58130)
  "58130": Categories["Jornais e Revista"], // Edição de revistas e periódicos (was 58140)

  // Restauração
  "47240": Categories["Alimentacao/Hotelaria"],

  // Comércio a retalho de livros
  "47610": Categories["Comercio a retalho de livros"],

  // Atividades de Museus e Monumentos Históricos
  "91210": Categories["Atividades dos museus e monumentos historicos"],
  "91220": Categories["Atividades dos museus e monumentos historicos"],

  // Outros
  "47711": Categories.Outros, // Clothing
  "47721": Categories.Outros, // Footwear
  "47712": Categories.Outros, // Vestuário para bebés e crianças
  "47300": Categories.Outros, // Fuel (retail)
  "46811": Categories.Outros, // Fuel (wholesale)
  "47782": Categories.Outros, // Combustíveis para uso doméstico
  "19201": Categories.Outros, // Fabricação de produtos petrolíferos refinados
  "47521": Categories.Outros, // Hardware
  "47540": Categories.Outros, // Appliances
  "47591": Categories.Outros, // Furniture
  "47410": Categories.Outros, // Tech
  "82190": Categories.Outros, // Apoio administrativo
  "35151": Categories.Outros, // Comércio de eletricidade
  "35152": Categories.Outros, // Comércio de eletricidade para mobilidade elétrica
  "35230": Categories.Outros, // Comércio de gás por condutas
  "36002": Categories.Outros, // Distribuição de água
  "61100": Categories.Outros, // Telecoms
  "61200": Categories.Outros, // Telecoms (revenda/intermediação)
  "52211": Categories.Outros, // Gestão de infraestruturas dos transportes terrestres
  "47122": Categories.Outros, // Grandes armazéns / não especializado sem predominância alimentar)
  "47750": Categories.Outros, // Cosméticos e higiene
  "46900": Categories.Outros, // Comércio por grosso não especializado
  "46390": Categories.Outros, // Comércio por grosso não especializado de produtos alimentares
  "81100": Categories.Outros // Atividades combinadas de apoio aos edifícios
};

export const PREFIX_CAE_REV4_MAP: CAEMapper = {
  "9621": Categories.Cabeleireiro, // Salões de cabeleireiro e barbeiros
  "9622": Categories.Cabeleireiro, // Institutos de beleza
  "9531": Categories["Reparacao Automovel"],
  "750": Categories["Animais de Estimacao"],
  "471": Categories.Outros, // Supermarkets
  "90": Categories["Atividades artisticas e literarias"],
  "87": Categories.Lares,
  "86": Categories.Saude,
  "85": Categories.Educacao,
  "56": Categories["Alimentacao/Hotelaria"],
  "55": Categories["Alimentacao/Hotelaria"],
  "51": Categories.Transportes,
  "50": Categories.Transportes,
  "49": Categories.Transportes,
  "10": Categories["Alimentacao/Hotelaria"] // Indústrias alimentares
};
