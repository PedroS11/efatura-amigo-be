export interface SearchNifPtResponse {
  result: "success" | "error";
  records?: Records;
  message?: string;
  nif_validation: boolean;
  is_nif: boolean;
  credits: Credits;
}

export interface Records {
  [nif: string]: NifPTCompany;
}

export interface NifPTCompany {
  nif: number;
  seo_url: string;
  title: string;
  address: string;
  pc4: string;
  pc3: string;
  city: string;
  activity: string;
  status: string;
  cae: string | string[];
  contacts: Contacts;
  structure: Structure;
  geo: Geo;
  start_date: string;
  place: Place;
  racius: string;
  alias?: string;
  portugalio?: string;
}

export interface Contacts {
  email: string | null;
  phone: string | null;
  website: string | null;
  fax: string | null;
}

export interface Structure {
  nature: string;
  capital: string;
  capital_currency: string;
}

export interface Geo {
  region: string;
  county: string;
  parish: string;
}

export interface Place {
  address: string;
  pc4: string;
  pc3: string;
  city: string;
}

export interface Credit {
  month: number;
  day: number;
  hour: number;
  minute: number;
  paid: number;
}
export interface Credits {
  used: string;
  left: Credit;
}

export interface GetCreditsResponse {
  credits: Credit;
}

export interface SearchNifResponse {
  error: boolean;
  company?: NifPTCompany;
  message?: string;
}
