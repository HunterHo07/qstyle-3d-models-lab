const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const js = fs.readFileSync(path.join(root, "main.js"), "utf8");
const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const manifestPath = path.join(root, "models", "manifest.json");

assert.ok(fs.existsSync(manifestPath), "Assets 3 should expose a real local GLB manifest");

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
assert.ok(Array.isArray(manifest.assets), "Manifest should contain an assets array");
assert.ok(manifest.assets.length >= 12, `Expected at least 12 real GLB assets, found ${manifest.assets.length}`);

const categories = new Set(manifest.assets.map((asset) => asset.category));
for (const category of ["character", "cute", "animated", "prop", "vehicle"]) {
  assert.ok(categories.has(category), `Missing model category: ${category}`);
}

const animatedAssets = manifest.assets.filter((asset) => asset.animated);
assert.ok(animatedAssets.length >= 4, `Expected at least 4 animated GLB assets, found ${animatedAssets.length}`);

function readGlbJson(filePath) {
  const buffer = fs.readFileSync(filePath);
  assert.equal(buffer.toString("utf8", 0, 4), "glTF", `Invalid GLB magic: ${filePath}`);
  assert.equal(buffer.readUInt32LE(4), 2, `Invalid GLB version: ${filePath}`);
  const jsonLength = buffer.readUInt32LE(12);
  const chunkType = buffer.toString("utf8", 16, 20);
  assert.equal(chunkType, "JSON", `First GLB chunk should be JSON: ${filePath}`);
  return JSON.parse(buffer.toString("utf8", 20, 20 + jsonLength).trim());
}

for (const asset of manifest.assets) {
  assert.ok(asset.id && asset.name && asset.category && asset.file, `Manifest asset is missing required fields: ${JSON.stringify(asset)}`);
  const modelPath = path.join(root, asset.file);
  assert.ok(fs.existsSync(modelPath), `Missing GLB model file: ${asset.file}`);
  assert.ok(fs.statSync(modelPath).size > 2000, `GLB model looks too small to be a useful asset: ${asset.file}`);
  const gltf = readGlbJson(modelPath);
  assert.ok(gltf.nodes && gltf.meshes && gltf.materials, `GLB should contain nodes, meshes, and materials: ${asset.file}`);
  assert.ok(gltf.nodes.some((node) => node.name), `GLB nodes should be named for reuse: ${asset.file}`);
  if (asset.animated) {
    assert.ok(Array.isArray(gltf.animations) && gltf.animations.length > 0, `Animated asset should include embedded animation clips: ${asset.file}`);
  }
}

assert.ok(html.includes("Real GLB assets") && html.includes("Download GLB"), "UI should clearly present real downloadable GLB assets");
assert.ok(js.includes("GLTFLoader") && js.includes("AnimationMixer"), "Viewer should load real GLB files and play embedded animations");
assert.ok(js.includes("models/manifest.json") && js.includes("downloadUrl"), "Viewer should render from the local model manifest with download links");
assert.ok(!js.includes("for (let i = 0; i < 200") && !html.includes("procedural browser models"), "Assets 3 should not keep the old fake 200 procedural model catalog");
assert.ok(css.includes(".asset-viewer") && css.includes(".download-link"), "Styles should support a real model viewer and GLB download cards");

console.log("Q-style GLB asset checks passed.");
