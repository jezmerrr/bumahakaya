// Reused-photo check, part of Smart check. Each photo is shrunk to a 9×8 grid
// of brightness values, and we note whether each square is brighter than the
// one to its right (a "difference hash"). Resizing or re-saving a photo
// barely changes that pattern, so two photos with nearly the same pattern
// are the same photo. Runs on the phone: free, and no photo leaves it.

const GRID_W = 9;
const GRID_H = 8;
// Photos are first drawn at 4× the grid size, then averaged in 4×4 blocks,
// which is steadier than letting the browser shrink straight to 9×8.
const SAMPLE = 4;
// Out of 64. Re-saved copies of one photo land around 0–4; different photos
// are usually far apart.
export const SAME_PHOTO_MAX_BITS = 6;
const LOAD_TIMEOUT_MS = 8_000;

// Brightness of each pixel from RGBA bytes.
export function toGray(rgba: ArrayLike<number>): number[] {
  const out: number[] = [];
  for (let i = 0; i + 3 < rgba.length; i += 4) {
    out.push(0.299 * rgba[i] + 0.587 * rgba[i + 1] + 0.114 * rgba[i + 2]);
  }
  return out;
}

// Average a (w·SAMPLE)×(h·SAMPLE) grayscale image down to w×h.
export function blockAverage(
  gray: ArrayLike<number>,
  w: number,
  h: number,
  sample: number,
): number[] {
  const out: number[] = [];
  const rowLen = w * sample;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let sum = 0;
      for (let dy = 0; dy < sample; dy++) {
        for (let dx = 0; dx < sample; dx++) {
          sum += gray[(y * sample + dy) * rowLen + x * sample + dx];
        }
      }
      out.push(sum / (sample * sample));
    }
  }
  return out;
}

// 64 bits as a "0"/"1" string, from a 9×8 grayscale grid.
export function differenceHash(grid: ArrayLike<number>): string {
  let bits = "";
  for (let y = 0; y < GRID_H; y++) {
    for (let x = 0; x < GRID_W - 1; x++) {
      bits += grid[y * GRID_W + x] > grid[y * GRID_W + x + 1] ? "1" : "0";
    }
  }
  return bits;
}

export function hammingDistance(a: string, b: string): number {
  let d = Math.abs(a.length - b.length);
  for (let i = 0; i < Math.min(a.length, b.length); i++) if (a[i] !== b[i]) d++;
  return d;
}

export function isSamePhoto(a: string, b: string): boolean {
  return hammingDistance(a, b) <= SAME_PHOTO_MAX_BITS;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const timer = setTimeout(() => reject(new Error("timeout")), LOAD_TIMEOUT_MS);
    img.onload = () => {
      clearTimeout(timer);
      resolve(img);
    };
    img.onerror = () => {
      clearTimeout(timer);
      reject(new Error("load failed"));
    };
    img.src = src;
  });
}

async function computeFingerprint(src: string): Promise<string | null> {
  if (typeof document === "undefined") return null;
  try {
    const img = await loadImage(src);
    const canvas = document.createElement("canvas");
    canvas.width = GRID_W * SAMPLE;
    canvas.height = GRID_H * SAMPLE;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    return differenceHash(blockAverage(toGray(data), GRID_W, GRID_H, SAMPLE));
  } catch {
    return null;
  }
}

const cache = new Map<string, Promise<string | null>>();

// The photo's fingerprint, or null if it can't be read. Cached per photo.
export function photoFingerprint(src: string): Promise<string | null> {
  let p = cache.get(src);
  if (!p) {
    p = computeFingerprint(src);
    cache.set(src, p);
  }
  return p;
}

export interface PhotoCandidate {
  id: string;
  title: string;
  photoUrl: string;
}

// The first other post that already uses this photo, or null if none does.
// Returns undefined when the photo can't be checked.
export async function findReusedPhoto(
  photoUrl: string,
  others: PhotoCandidate[],
): Promise<PhotoCandidate | null | undefined> {
  const exact = others.find((o) => o.photoUrl === photoUrl);
  if (exact) return exact;
  const mine = await photoFingerprint(photoUrl);
  if (!mine) return undefined;
  for (const o of others) {
    const theirs = await photoFingerprint(o.photoUrl);
    if (theirs && isSamePhoto(mine, theirs)) return o;
  }
  return null;
}
