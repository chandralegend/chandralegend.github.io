import { readFile } from "node:fs/promises";
import { join } from "node:path";

const dir = join(process.cwd(), "node_modules/@fontsource");

/** Fonts for next/og cards, read from @fontsource at build time. */
export async function ogFonts() {
  const [serif, serifItalic, mono] = await Promise.all([
    readFile(join(dir, "instrument-serif/files/instrument-serif-latin-400-normal.woff")),
    readFile(join(dir, "instrument-serif/files/instrument-serif-latin-400-italic.woff")),
    readFile(join(dir, "geist-mono/files/geist-mono-latin-400-normal.woff")),
  ]);
  return [
    { name: "Instrument Serif", data: serif, style: "normal" as const, weight: 400 as const },
    { name: "Instrument Serif", data: serifItalic, style: "italic" as const, weight: 400 as const },
    { name: "Geist Mono", data: mono, style: "normal" as const, weight: 400 as const },
  ];
}
