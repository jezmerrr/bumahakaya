import { describe, expect, it } from "vitest";
import {
  blockAverage,
  differenceHash,
  findReusedPhoto,
  hammingDistance,
  isSamePhoto,
  SAME_PHOTO_MAX_BITS,
  toGray,
} from "./photoCheck";

// A 9×8 grid where every row runs from `left` to `right` brightness.
function gradient(left: number, right: number): number[] {
  const row = Array.from({ length: 9 }, (_, x) => left + ((right - left) * x) / 8);
  return Array.from({ length: 8 }, () => row).flat();
}

describe("differenceHash", () => {
  it("is 64 bits: 1 where a square is brighter than the next", () => {
    expect(differenceHash(gradient(255, 0))).toBe("1".repeat(64));
    expect(differenceHash(gradient(0, 255))).toBe("0".repeat(64));
  });

  it("barely changes when the photo is a little brighter overall", () => {
    const a = differenceHash(gradient(200, 20));
    const b = differenceHash(gradient(200, 20).map((v) => v + 10));
    expect(hammingDistance(a, b)).toBe(0);
  });
});

describe("comparing fingerprints", () => {
  it("counts differing bits", () => {
    expect(hammingDistance("1010", "1010")).toBe(0);
    expect(hammingDistance("1010", "0110")).toBe(2);
    expect(hammingDistance("10", "1011")).toBe(2);
  });

  it("treats up to a few differing bits as the same photo", () => {
    const a = "0".repeat(64);
    const near = "1".repeat(SAME_PHOTO_MAX_BITS) + "0".repeat(64 - SAME_PHOTO_MAX_BITS);
    const far = "1".repeat(SAME_PHOTO_MAX_BITS + 1) + "0".repeat(63 - SAME_PHOTO_MAX_BITS);
    expect(isSamePhoto(a, near)).toBe(true);
    expect(isSamePhoto(a, far)).toBe(false);
  });
});

describe("shrinking a photo", () => {
  it("turns RGBA into brightness", () => {
    expect(toGray([255, 255, 255, 255, 0, 0, 0, 255])).toEqual([255, 0]);
  });

  it("averages blocks", () => {
    // 4×2 image, 2×2 blocks → 2×1
    const gray = [0, 0, 100, 100, 0, 0, 100, 100];
    expect(blockAverage(gray, 2, 1, 2)).toEqual([0, 100]);
  });
});

describe("findReusedPhoto", () => {
  it("matches a post that uses the very same photo", async () => {
    const other = { id: "r-1", title: "Flooding Taft", photoUrl: "/demo/a.jpg" };
    await expect(findReusedPhoto("/demo/a.jpg", [other])).resolves.toBe(other);
  });
});
