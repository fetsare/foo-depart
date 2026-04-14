import fs from "node:fs";
import path from "node:path";

const reportsDir = path.resolve(".lighthouseci");
const readmeFiles = [path.resolve("README.md"), path.resolve("README.sv.md")];

if (!fs.existsSync(reportsDir)) {
  console.error("No .lighthouseci directory found. Run LHCI collect first.");
  process.exit(1);
}

const reportFiles = fs
  .readdirSync(reportsDir)
  .filter((file) => file.endsWith(".json"))
  .map((file) => path.join(reportsDir, file));

const lighthouseReports = reportFiles
  .map((filePath) => {
    try {
      const json = JSON.parse(fs.readFileSync(filePath, "utf8"));
      return json && json.categories ? { filePath, report: json } : null;
    } catch {
      return null;
    }
  })
  .filter(Boolean)
  .sort((a, b) => {
    const aTime = fs.statSync(a.filePath).mtimeMs;
    const bTime = fs.statSync(b.filePath).mtimeMs;
    return bTime - aTime;
  });

if (lighthouseReports.length === 0) {
  console.error("No Lighthouse report JSON files found in .lighthouseci.");
  process.exit(1);
}

const latest = lighthouseReports[0].report;
const categories = latest.categories || {};

const toPercent = (score) => `${Math.round((score || 0) * 100)}%`;
const timestamp = new Date().toISOString();
const testedUrl = latest.finalUrl || latest.requestedUrl || "http://localhost:3000";

const englishBlock = [
  "<!-- LIGHTHOUSE:START -->",
  "## Latest Lighthouse Result",
  "",
  `Updated: ${timestamp}`,
  `Tested URL: ${testedUrl}`,
  "",
  "| Category | Score |",
  "|---|---:|",
  `| Performance | ${toPercent(categories.performance?.score)} |`,
  `| Accessibility | ${toPercent(categories.accessibility?.score)} |`,
  `| Best Practices | ${toPercent(categories["best-practices"]?.score)} |`,
  `| SEO | ${toPercent(categories.seo?.score)} |`,
  "",
  "<!-- LIGHTHOUSE:END -->",
  "",
].join("\n");

const swedishBlock = [
  "<!-- LIGHTHOUSE:START -->",
  "## Senaste Lighthouse-resultat",
  "",
  `Uppdaterad: ${timestamp}`,
  `Testad URL: ${testedUrl}`,
  "",
  "| Kategori | Poang |",
  "|---|---:|",
  `| Performance | ${toPercent(categories.performance?.score)} |`,
  `| Accessibility | ${toPercent(categories.accessibility?.score)} |`,
  `| Best Practices | ${toPercent(categories["best-practices"]?.score)} |`,
  `| SEO | ${toPercent(categories.seo?.score)} |`,
  "",
  "<!-- LIGHTHOUSE:END -->",
  "",
].join("\n");

const markerRegex = /<!-- LIGHTHOUSE:START -->[\s\S]*?<!-- LIGHTHOUSE:END -->\n?/m;

function upsertBlock(filePath, block) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const content = fs.readFileSync(filePath, "utf8");
  let nextContent;

  if (markerRegex.test(content)) {
    nextContent = content.replace(markerRegex, `${block}\n`);
  } else {
    nextContent = `${content.trimEnd()}\n\n${block}\n`;
  }

  fs.writeFileSync(filePath, nextContent, "utf8");
}

upsertBlock(readmeFiles[0], englishBlock);
upsertBlock(readmeFiles[1], swedishBlock);

console.log("Updated latest Lighthouse result in README files.");
