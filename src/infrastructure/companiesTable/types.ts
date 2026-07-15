export enum Categories {
  Saude,
  Ginasio,
  Educacao,
  Imoveis,
  Lares,
  Outros,
  "Reparacao Automovel",
  "Reparacao Motas",
  "Alimentacao/Hotelaria",
  Cabeleireiro,
  "Animais de Estimacao",
  Transportes,
  "Jornais e Revista",
  "Comercio a retalho de livros",
  "Atividades artisticas e literarias",
  "Atividades dos museus e monumentos historicos"
}

export interface Company {
  nif: number;
  name: string;
  category?: Categories;
  caeRev3?: string;
  updatedAt: number;
}
