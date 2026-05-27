import { BADGE_CRITERIA, CURRENCY_NOTATIONS } from "@/constants";
import type {
  BadgeCounts,
  BadgeParams,
  RemoveUrlQueryParams,
  UrlQueryParams,
} from "@/types";
import type { GetFormattedSalaryParams } from "@/types/shared";
import { clsx, type ClassValue } from "clsx";
import qs from "query-string";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getTimestamp = (createdAt: Date): string => {
  const now: Date = new Date();
  const timeDifference: number = now.getTime() - createdAt.getTime();

  const timeUnits: {
    unit: string;
    milliseconds: number;
  }[] = [
    { unit: "year", milliseconds: 365 * 24 * 60 * 60 * 1000 },
    { unit: "month", milliseconds: 30 * 24 * 60 * 60 * 1000 },
    { unit: "week", milliseconds: 7 * 24 * 60 * 60 * 1000 },
    { unit: "day", milliseconds: 24 * 60 * 60 * 1000 },
    { unit: "hour", milliseconds: 60 * 60 * 1000 },
    { unit: "minute", milliseconds: 60 * 1000 },
    { unit: "second", milliseconds: 1000 },
  ];

  for (const { unit, milliseconds } of timeUnits) {
    const time: number = Math.floor(timeDifference / milliseconds);
    if (time >= 1) {
      return `${time} ${unit}${time === 1 ? "s" : ""} ago`;
    }
  }

  return "Just now";
};

export const getFormattedNumber = (number: number): string => {
  if (number < 1000) return number.toString();
  if (number < 1000000) return `${(number / 1000).toFixed(1)}K`;
  if (number < 1000000000) return `${(number / 1000000).toFixed(1)}M`;
  return `${(number / 1000000000).toFixed(1)}B`;
};

export const getFormattedJoinedDate = (date: Date): string => {
  const month: string = date.toLocaleString("en", { month: "long" });
  const year: number = date.getFullYear();

  return `Joined ${month} ${year}`;
};

export const formUrlQuery = ({
  params,
  key,
  value,
}: UrlQueryParams): string => {
  const currentUrl = qs.parse(params);

  currentUrl[key] = value;

  return qs.stringifyUrl(
    {
      url: window.location.pathname,
      query: currentUrl,
    },
    { skipNull: true }
  );
};

export const removeKeysFromQuery = ({
  params,
  keysToRemove,
}: RemoveUrlQueryParams): string => {
  const currentUrl = qs.parse(params);

  keysToRemove.forEach((key) => {
    delete currentUrl[key];
  });

  return qs.stringifyUrl(
    {
      url: window.location.pathname,
      query: currentUrl,
    },
    { skipNull: true }
  );
};

export const assignBadges = (params: BadgeParams): BadgeCounts => {
  const badgeCounts: BadgeCounts = {
    GOLD: 0,
    SILVER: 0,
    BRONZE: 0,
  };

  const { criteria } = params;

  criteria.forEach((item) => {
    const { type, count } = item;
    const badgeLevels: any = BADGE_CRITERIA[type];

    Object.keys(badgeLevels).forEach((level: any) => {
      if (count >= badgeLevels[level]) {
        badgeCounts[level as keyof BadgeCounts] += 1;
      }
    });
  });

  return badgeCounts;
};

const EMPLOYMENT_TYPE_LABELS: Record<string, string> = {
  fulltime: "Full-time",
  parttime: "Part-time",
  contractor: "Contractor",
  intern: "Internship",
};

export const employmentTypeConverter = (type: string): string => {
  return EMPLOYMENT_TYPE_LABELS[type] || "";
};

export const getFormattedSalary = ({
  min,
  max,
  currency,
  period,
}: GetFormattedSalaryParams) => {
  if (!min || !max) return null;

  const salaryInfo = {
    symbol: CURRENCY_NOTATIONS[currency] || "$",
    low: salaryFormatter(min, 1),
    high: salaryFormatter(max, 1),
    per: period ? `/${period.toLowerCase()}ly` : "",
  };

  const { symbol, low, high, per } = salaryInfo;

  const formattedSalary = `${symbol}${low} - ${symbol}${high}${per}`;

  return formattedSalary as string;
};

const salaryFormatter = (num: number, digits: number) => {
  const lookup = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: "k" },
    { value: 1e6, symbol: "M" },
    { value: 1e9, symbol: "G" },
    { value: 1e12, symbol: "T" },
    { value: 1e15, symbol: "P" },
    { value: 1e18, symbol: "E" },
  ];

  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  const lookupItem = lookup
    .slice()
    .reverse()
    .find((item) => num >= item.value);
  return lookupItem
    ? (num / lookupItem.value).toFixed(digits).replace(rx, "$1") +
        lookupItem.symbol
    : "0";
};

export function isValidImage(url: string) {
  return /\.(jpg|jpeg|png|webp||svg)$/.test(url);
}

export function processJobTitle(title: string | undefined | null): string {
  if (title === undefined || title === null) {
    return "No Job Title";
  }

  const words = title.split(" ");

  const validWords = words.filter((word) => {
    return (
      word !== undefined &&
      word !== null &&
      word.toLowerCase() !== "undefined" &&
      word.toLowerCase() !== "null"
    );
  });

  if (validWords.length === 0) {
    return "No Job Title";
  }

  const processedTitle = validWords.join(" ");

  return processedTitle;
}
