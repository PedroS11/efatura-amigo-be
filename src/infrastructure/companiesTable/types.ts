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
  "Jornais e Revista"
}

export interface Company {
  nif: number;
  name: string;
  category?: Categories;
  updatedAt: number;
}
