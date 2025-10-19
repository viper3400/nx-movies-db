// tools/docs/generate-video-docs.mjs
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import YAML from "yaml";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Pfade ggf. anpassen
const YAML_PATH = path.resolve(__dirname, "../../docs/video-data-mapping.yml");
const MD_PATH   = path.resolve(__dirname, "../../docs/video-data-mapping.md");

// Marker-Konstanten
const OVERVIEW_START = "<!-- AUTO-GENERATED: overview:start -->";
const OVERVIEW_END   = "<!-- AUTO-GENERATED: overview:end -->";
const DETAILS_START  = "<!-- AUTO-GENERATED: details:start -->";
const DETAILS_END    = "<!-- AUTO-GENERATED: details:end -->";

// Utility
function cell(v) {
  if (v == null) return "";
  return String(v).replace(/\|/g, "\\|").trim();
}

function safeList(items) {
  return Array.isArray(items) ? items : [];
}

// Tabelle erzeugen (kurz & knapp, nur Keywords!)
function buildOverviewTable(useCases) {
  const header = [
    "| Use Case      | Path     | GraphQL Query |",
    "|---------------|----------|---------------|",
  ];
  const rows = useCases.map(uc => {
    const comps = safeList(uc.components).join(", ");
    return `| ${cell(uc.name)} | ${cell(uc.path)} | ${cell(uc.gqlQuery)} |`;
  });
  return [...header, ...rows].join("\n");
}

// Detail-Abschnitte erzeugen (lesbar, ohne Tabellen-Prosa)
function buildDetailsSections(useCases) {
  const parts = [];
  for (const uc of useCases) {
    parts.push(
      `### ${uc.name}
- Path: ${uc.path ?? ""}
- GraphQL Query: ${uc.gqlQuery ?? ""}
- UI Components:${safeList(uc.components).length ? "" : " –"}
${safeList(uc.components).map(c => `  - ${c}`).join("\n")}
- Description:${safeList(uc.description).length ? "" : " –"}
${safeList(uc.description).map(d => `  - ${d}`).join("\n")}
`
    );
  }
  return parts.join("\n").trim() + "\n";
}

// Hilfsfunktion: einen Marker-Block ersetzen
function replaceBlock(md, startMarker, endMarker, inner) {
  const startIdx = md.indexOf(startMarker);
  const endIdx = md.indexOf(endMarker);
  if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
    throw new Error(`Marker not found or in wrong order:\n${startMarker}\n${endMarker}`);
  }

  const newline = md.includes("\r\n") ? "\r\n" : "\n";
  const before = md.slice(0, startIdx + startMarker.length);
  const after  = md.slice(endIdx + endMarker.length); // 👈 move *past* the end marker
  // ensure exactly one newline between start marker and content
  return `${before}${newline}${inner}${newline}${endMarker}${after.startsWith(newline) ? after : newline + after}`;
}

async function main() {
  // YAML laden
  const yamlRaw = await fs.readFile(YAML_PATH, "utf8");
  const data = YAML.parse(yamlRaw);
  if (!data || !Array.isArray(data.useCases)) {
    throw new Error(`YAML ungültig: Erwartet { useCases: [...] } in ${YAML_PATH}`);
  }

  // Inhalte bauen
  const table = buildOverviewTable(data.useCases);
  const details = buildDetailsSections(data.useCases);

  // MD laden
  let md = await fs.readFile(MD_PATH, "utf8");

  // Beide Blöcke ersetzen
  md = replaceBlock(md, OVERVIEW_START, OVERVIEW_END, table);
  md = replaceBlock(md, DETAILS_START, DETAILS_END, details);

  // Schreiben nur bei Änderung
  await fs.writeFile(MD_PATH, md, "utf8");
  console.log("✓ Overview & Details aktualisiert.");
}

main().catch(err => {
  console.error("✗ Fehler beim Generieren:", err.message || err);
  process.exit(1);
});
