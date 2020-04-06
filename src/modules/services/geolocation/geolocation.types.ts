interface IGeoResponseSchema {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  address: {
    house_number: string;
    road: string;
    neighbourhood: string;
    suburb: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
    country_code: string;
  };
}

export interface IGeoResponseSearch extends IGeoResponseSchema {
  importance: number;
}

export interface IGeoResponseReverse extends IGeoResponseSchema {
  extratags: {
    [key: string]: string;
  };
  namedetails: {
    [key: string]: string;
  };
}
