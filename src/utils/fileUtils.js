import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resuelve rutas relativas a src/
export const resolveDataPath = (relative) =>
  path.resolve(__dirname, "..", "data", relative);

export async function ensureFile(filePath, defaultContent = "[]") {
  try {
    await fs.access(filePath);
  } catch {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, defaultContent, "utf-8");
  }
}

export async function readJSON(filePath) {
  await ensureFile(filePath, "[]");
  const data = await fs.readFile(filePath, "utf-8");
  try {
    return JSON.parse(data || "[]");
  } catch {
    // Si se corrompe, lo reestablece
    await fs.writeFile(filePath, "[]", "utf-8");
    return [];
  }
}

export async function writeJSON(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}
