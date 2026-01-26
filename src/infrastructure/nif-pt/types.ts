export interface NifPtResponse {
  result: "success" | "error";
  records?: Records;
  message: string;
  nif_validation: boolean;
  is_nif: boolean;
  credits: Credits;
}

export interface Records {
  [nif: number]: NifPTCompany;
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
  cae: string;
  contacts: Contacts;
  structure: Structure;
  geo: Geo;
  place: Place;
  racius: string;
  alias: string;
  portugalio: string;
}

export interface Contacts {
  email: string;
  phone: string;
  website: string;
  fax: string;
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

/**
 * {
 *     "result": "error",
 *     "message": "No records found",
 *     "nif_validation": false,
 *     "is_nif": false,
 *     "credits": {
 *         "used": "free",
 *         "left": {
 *             "month": 995,
 *             "day": 95,
 *             "hour": 5,
 *             "minute": 0,
 *             "paid": 0
 *         }
 *     }
 * }
 */
