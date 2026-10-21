import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
// Playwright accessibility snapshots can include password input values even
// though the actual UI masks them. Do not retain credentials in error reports.
export default async function redactArtifacts(config) {
  const secrets = [
    process.env.E2E_ADMIN_PASSWORD,
    process.env.JWT_SECRET,
  ].filter((v) => typeof v === "string" && v.length >= 12);
  async function walk(dir) {
    let entries;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch (e) {
      if (e.code === "ENOENT") return;
      throw e;
    }
    for (const entry of entries) {
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) await walk(file);
      else if (/\.(md|json|txt|log)$/.test(entry.name)) {
        const original = await readFile(file, "utf8");
        let redacted = original;
        for (const secret of secrets)
          redacted = redacted.replaceAll(secret, "[REDACTED]");
        if (redacted !== original) await writeFile(file, redacted);
      }
    }
  }
  for (const dir of new Set(config.projects.map((p) => p.outputDir)))
    await walk(dir);
}
