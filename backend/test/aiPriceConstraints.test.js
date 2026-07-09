import { describe, expect, it } from "vitest";
import { extractPriceConstraints, parseVietnamesePrice } from "../src/services/user/aiTextUtils.js";

describe("parseVietnamesePrice", () => {
  it("parses triệu and k", () => {
    expect(parseVietnamesePrice("2 trieu")).toBe(2000000);
    expect(parseVietnamesePrice("1.5tr")).toBe(1500000);
    expect(parseVietnamesePrice("500k")).toBe(500000);
  });
});

describe("extractPriceConstraints", () => {
  it("extracts min price from Vietnamese phrases", () => {
    const result = extractPriceConstraints(
      "cho goi y ve vot cau long cho nguoi moi choi gia tren 2 trieu",
    );
    expect(result.minPrice).toBe(2000000);
    expect(result.maxPrice).toBeNull();
  });

  it("extracts max price", () => {
    const result = extractPriceConstraints("vot duoi 1.5 trieu");
    expect(result.maxPrice).toBe(1500000);
    expect(result.minPrice).toBeNull();
  });

  it("treats bare budget as a price band", () => {
    const result = extractPriceConstraints("vot cau long gia 2 trieu");
    expect(result.minPrice).toBe(1700000);
    expect(result.maxPrice).toBe(2300000);
  });

  it("handles common trieu typos", () => {
    const result = extractPriceConstraints("vot cau long gia tren 2 triieeuj");
    expect(result.minPrice).toBe(2000000);
  });
});
