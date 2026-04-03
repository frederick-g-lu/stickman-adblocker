const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const root = path.resolve(__dirname, "..");

function readJson(filePath) {
  const full = path.join(root, filePath);
  const raw = fs.readFileSync(full, "utf8");
  return JSON.parse(raw);
}

function ensure(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function validateManifest() {
  const manifest = readJson("manifest.json");
  ensure(manifest.manifest_version === 3, "manifest_version must be 3");
  ensure(typeof manifest.name === "string" && manifest.name.length > 0, "manifest name missing");
  ensure(Array.isArray(manifest.permissions), "manifest permissions missing");
  ensure(manifest.background && manifest.background.service_worker, "background service worker missing");
  ensure(
    manifest.declarative_net_request &&
      Array.isArray(manifest.declarative_net_request.rule_resources),
    "declarative_net_request.rule_resources missing"
  );

  return manifest;
}

function validateRules(ruleFile) {
  const rules = readJson(ruleFile);
  ensure(Array.isArray(rules), `${ruleFile}: must be an array`);

  const seen = new Set();
  for (const rule of rules) {
    ensure(typeof rule.id === "number", `${ruleFile}: rule id must be number`);
    ensure(!seen.has(rule.id), `${ruleFile}: duplicate id ${rule.id}`);
    seen.add(rule.id);
    ensure(rule.action && typeof rule.action.type === "string", `${ruleFile}: action missing`);
    ensure(rule.condition && typeof rule.condition === "object", `${ruleFile}: condition missing`);
  }
}

function checkJsSyntax(filePath) {
  const full = path.join(root, filePath);
  const result = spawnSync(process.execPath, ["--check", full], { encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(`Syntax check failed for ${filePath}\n${result.stderr || result.stdout}`);
  }
}

function main() {
  const manifest = validateManifest();

  const ruleFiles = manifest.declarative_net_request.rule_resources.map((item) => item.path);
  for (const file of ruleFiles) {
    validateRules(file);
  }

  checkJsSyntax("src/background/service-worker.js");
  checkJsSyntax("src/content/page-cleaner.js");
  checkJsSyntax("src/content/stickman-physics.js");
  checkJsSyntax("popup/popup.js");

  console.log("Validation passed.");
}

try {
  main();
} catch (error) {
  console.error(String(error.message || error));
  process.exit(1);
}
