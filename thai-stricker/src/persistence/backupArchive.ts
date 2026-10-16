import { strFromU8, strToU8, unzipSync, zipSync } from "fflate";
import { SECTION_FILE_NAMES } from "./appRepository";
import type { NamedSectionImport, ThaiStrickerSectionFileV1 } from "../types/domain";

export type BackupInputFile = {
  name: string;
  arrayBuffer(): Promise<ArrayBuffer>;
  text(): Promise<string>;
};

export function buildSectionArchive(files: ThaiStrickerSectionFileV1[]): Uint8Array {
  const entries = Object.fromEntries(files.map((file) => [SECTION_FILE_NAMES[file.fileType], strToU8(JSON.stringify(file, null, 2))]));
  return zipSync(entries, { level: 6 });
}

export async function readSectionImports(files: BackupInputFile[]): Promise<NamedSectionImport[]> {
  const imports: NamedSectionImport[] = [];
  const knownNames = new Set(Object.values(SECTION_FILE_NAMES));
  for (const file of files) {
    if (file.name.toLocaleLowerCase().endsWith(".zip")) {
      const entries = unzipSync(new Uint8Array(await file.arrayBuffer()));
      for (const [filename, bytes] of Object.entries(entries)) {
        if (filename.endsWith("/") || !knownNames.has(filename)) throw new Error(`Unknown filename: ${filename}.`);
        try { imports.push({ filename, content: JSON.parse(strFromU8(bytes)) as unknown }); }
        catch { throw new Error(`${filename} does not contain a valid JSON document.`); }
      }
    } else {
      if (!knownNames.has(file.name)) throw new Error(`Unknown filename: ${file.name}.`);
      try { imports.push({ filename: file.name, content: JSON.parse(await file.text()) as unknown }); }
      catch { throw new Error(`${file.name} does not contain a valid JSON document.`); }
    }
  }
  if (!imports.length) throw new Error("No recognized JSON files.");
  const names = new Set<string>();
  for (const item of imports) {
    if (names.has(item.filename)) throw new Error(`Duplicate file: ${item.filename}.`);
    names.add(item.filename);
  }
  return imports;
}
