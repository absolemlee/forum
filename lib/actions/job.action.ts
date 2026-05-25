import { JobFilterParams } from "@/types/shared";
import { Country } from "@/types";

export const fetchLocation = async () => {
  const response = await fetch("http://ip-api.com/json/?fields=country");
  const location = await response.json();
  return location.country;
};

export const fetchCountries = async (): Promise<Country[]> => {
  try {
    const response = await fetch("https://restcountries.com/v3.1/all");

    if (!response.ok) {
      console.error("fetchCountries failed", {
        status: response.status,
        statusText: response.statusText,
      });
      return [];
    }

    const result: unknown = await response.json();

    if (!Array.isArray(result)) {
      return [];
    }

    return result
      .map((item) => {
        if (
          typeof item === "object" &&
          item !== null &&
          "name" in item &&
          typeof item.name === "object" &&
          item.name !== null &&
          "common" in item.name &&
          typeof item.name.common === "string"
        ) {
          return { name: { common: item.name.common } };
        }

        return null;
      })
      .filter((country): country is Country => country !== null);
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const fetchJobs = async (filters: JobFilterParams) => {
  const { query, page } = filters;

  const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:3000"}/api/rapidapi`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      searchQuery: query,
      page,
      pageSize: 1,
    }),
  });

  const result = await response.json();

  return result.result;
};
