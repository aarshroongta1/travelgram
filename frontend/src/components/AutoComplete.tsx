import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import { useState, useEffect } from "react";

interface City {
  id: string;
  name: string;
  region: string;
  country: string;
}

interface Prop {
  onSelect: (city: City) => void;
}

function AutoComplete({ onSelect }: Prop) {
  const [query, setQuery] = useState("");
  const [cities, setCities] = useState<City[]>([]);
  const [finalCity, setFinalCity] = useState<City | null>(null);

  const fetchCities = async (search: string) => {
    try {
      const url = import.meta.env.VITE_GEODB_URL + encodeURIComponent(search);

      const response = await fetch(url, {
        headers: {
          "x-rapidapi-key": import.meta.env.VITE_RAPID_API_KEY,
          "x-rapidapi-host": "wft-geo-db.p.rapidapi.com",
        },
      });

      const data = await response.json();

      const matched: City[] = data.data.map((city: any) => ({
        id: city.id.toString(),
        name: city.name,
        region: city.region,
        country: city.country,
      }));

      setCities(matched);
    } catch (error) {
      setCities([]);
    }
  };

  useEffect(() => {
    if (query.length <= 2) {
      setCities([]);
      return;
    }
    const timeout = setTimeout(() => {
      fetchCities(query);
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div className="flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="relative">
          <Combobox
            value={finalCity}
            onChange={(city) => {
              setFinalCity(city);
              onSelect(city!);
            }}
          >
            <ComboboxInput
              className="w-full py-2 px-4 bg-white text-gray-700 rounded-3xl shadow-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="City"
              placeholder="Search for a city..."
              displayValue={(city: City) =>
                city ? `${city.name}, ${city.region}, ${city.country}` : ""
              }
              onChange={(e) => setQuery(e.target.value)}
            />

            <ComboboxOptions className="absolute z-10 w-full rounded-md bg-white border border-gray-300 shadow-lg max-h-60 overflow-auto">
              {cities.map((city) => (
                <ComboboxOption
                  key={city.id}
                  value={city}
                  className="p-2 cursor-pointer hover:bg-blue-100 data-[focus]:bg-blue-100 text-black text-left"
                >
                  {city.name}, {city.region}, {city.country}
                </ComboboxOption>
              ))}
            </ComboboxOptions>
          </Combobox>
        </div>
      </div>
    </div>
  );
}

export default AutoComplete;
