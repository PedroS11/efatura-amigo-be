import type { SearchNifPtResponse } from "../../types";

export const getSearchNifPtResponseFixture = (): SearchNifPtResponse => ({
  result: "success",
  records: {
    "515198374": {
      nif: 515198374,
      seo_url: "the-lake-caffe-lda",
      title: "The Lake Caffé, Lda",
      address: "Rua Manuel Gonçalves Ramos, Nº 55",
      pc4: "4470",
      pc3: "333",
      city: "Maia",
      start_date: "2018-12-07",
      activity:
        "Exploração da indústria hoteleira, nomeadamente exploração de estabelecimentos de café, restaurante, snack-bar, confeção e venda de produtos de confeitaria e pastelaria, pão-quente e similares",
      status: "active",
      cae: ["56303", "56101", "10712", "10711"],
      contacts: {
        email: null,
        phone: null,
        website: null,
        fax: null
      },
      structure: {
        nature: "LDA",
        capital: "5000.00",
        capital_currency: "EUR"
      },
      geo: {
        region: "Porto",
        county: "Maia",
        parish: "Maia"
      },
      place: {
        address: "Rua Manuel Gonçalves Ramos, Nº 55",
        pc4: "4470",
        pc3: "333",
        city: "Maia"
      },
      racius: "https://www.racius.com/the-lake-caffe-lda/"
    }
  },
  nif_validation: true,
  is_nif: true,
  credits: {
    used: "free",
    left: {
      month: 990,
      day: 90,
      hour: 9,
      minute: 0,
      paid: 0
    }
  }
});

export const getNoRecordFoundResponseFixture = (): SearchNifPtResponse => ({
  result: "error",
  message: "No records found",
  nif_validation: false,
  is_nif: false,
  credits: {
    used: "free",
    left: {
      month: 995,
      day: 95,
      hour: 5,
      minute: 0,
      paid: 0
    }
  }
});

export const getNoCreditsResponseFixture = (): SearchNifPtResponse => ({
  result: "error",
  message: "Limit per minute reached. Please, try again later or buy credits.",
  nif_validation: false,
  is_nif: true,
  credits: {
    used: "free",
    left: {
      month: 963,
      day: 96,
      hour: 6,
      minute: 0,
      paid: 0
    }
  }
});

export const getUnexpectedErrorResponseFixture = (): SearchNifPtResponse => ({
  result: "error",
  message: "Key is not valid.",
  nif_validation: false,
  is_nif: true,
  credits: {
    used: "free",
    left: {
      month: 963,
      day: 96,
      hour: 6,
      minute: 0,
      paid: 0
    }
  }
});
