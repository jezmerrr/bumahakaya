import { describe, expect, it } from "vitest";
import { filterReports, filterSocial, matchesQuery, normalize } from "./feed";
import { seedReports, seedSocial } from "@/data/seed";

describe("normalize", () => {
  it("lowercases, strips accents, and collapses spaces", () => {
    expect(normalize("  Parañaque   ST ")).toBe("paranaque st");
  });
});

describe("matchesQuery", () => {
  it("matches everything for an empty query", () => {
    expect(matchesQuery(["anything"], "   ")).toBe(true);
  });

  it("needs every word, in any field and any order", () => {
    const fields = ["Flooding Taft Ave cor. Estrada", "Taft Avenue, Malate"];
    expect(matchesQuery(fields, "estrada taft")).toBe(true);
    expect(matchesQuery(fields, "taft agno")).toBe(false);
  });

  it("ignores case and accents", () => {
    expect(matchesQuery(["Parañaque"], "PARANAQUE")).toBe(true);
  });
});

describe("filterReports", () => {
  it("filters by road condition", () => {
    const out = filterReports(seedReports, { query: "", severity: "Impassable" });
    expect(out.length).toBeGreaterThan(0);
    expect(out.every((r) => r.severity === "Impassable")).toBe(true);
  });

  it("combines search with the condition filter", () => {
    const out = filterReports(seedReports, {
      query: "taft",
      severity: "Passable",
    });
    expect(out.map((r) => r.id)).toEqual(["r-004"]);
  });

  it("finds reports by Filipino description, author, or water level", () => {
    expect(
      filterReports(seedReports, { query: "bewang", severity: null }).map(
        (r) => r.id,
      ),
    ).toEqual(["r-005"]);
    expect(
      filterReports(seedReports, { query: "denise", severity: null }).map(
        (r) => r.id,
      ),
    ).toEqual(["r-003"]);
    expect(
      filterReports(seedReports, { query: "waist-deep", severity: null }).map(
        (r) => r.id,
      ),
    ).toEqual(["r-005"]);
  });
});

describe("filterSocial", () => {
  it("searches post text and author", () => {
    expect(filterSocial(seedSocial, "mmda").map((p) => p.author)).toEqual([
      "@mmda",
    ]);
    expect(filterSocial(seedSocial, "agno").length).toBe(1);
  });
});
