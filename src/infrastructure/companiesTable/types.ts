export enum Categories {
  Saude,
  Ginasio,
  Educacao,
  Imoveis,
  Lares,
  Outros,
  // Number 6 is a <p> tag
  "Reparacao Automovel" = 7,
  "Reparacao Motas",
  "Alimentacao/Hotelaria",
  Cabeleireiro,
  "Animais de Estimacao",
  // Number 12 is a <p> tag
  Transportes = 13,
  "Jornais e Revista",
  "Comercio a Retalho de Livros",
  "Atividades Artisticas e Literarias",
  "Ativdades dos Museus e Monumentos Historicos"
}

export interface Company {
  nif: number;
  name: string;
  category?: Categories;
  caeRev3?: string;
  updatedAt: number;
}
