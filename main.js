import * as THREE from "three";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js";

const canvas = document.getElementById("scene");
const catalog = document.getElementById("catalog");
const filters = document.querySelectorAll("[data-filter]");
const count = document.getElementById("count");
const modelName = document.getElementById("model-name");
const modelMeta = document.getElementById("model-meta");
const modelNotes = document.getElementById("model-notes");
const downloadLink = document.getElementById("download-link");
const statusText = document.getElementById("viewer-status");
const verifyMode = new URLSearchParams(window.location.search).has("qstyle-verify");

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 1000);
const cameraTarget = new THREE.Vector3(0, 0.35, 0);
camera.position.set(0, 6.8, 13.5);
camera.lookAt(cameraTarget);

const modelSlots = new THREE.Group();
scene.add(modelSlots);
scene.add(new THREE.AmbientLight(0xffffff, 0.86));

const key = new THREE.DirectionalLight(0x9ff7ff, 2.1);
key.position.set(5, 8, 7);
scene.add(key);

const rim = new THREE.DirectionalLight(0xffd78a, 1.45);
rim.position.set(-5, 4, -4);
scene.add(rim);

const floor = new THREE.Mesh(
  new THREE.CylinderGeometry(8.2, 8.6, 0.12, 80),
  new THREE.MeshStandardMaterial({
    color: 0x0d2235,
    roughness: 0.7,
    metalness: 0.18,
    emissive: 0x071526,
    emissiveIntensity: 0.45
  })
);
floor.position.y = -1.22;
scene.add(floor);

let renderer = null;
const loader = new GLTFLoader();
const clock = new THREE.Clock();
const mixers = [];
let assets = [];
let activeFilter = "all";
let drag = false;
let lastX = 0;
let targetRotationY = 0;
let activeAssetId = null;
let loadedCount = 0;
const loadedSlots = new Map();
const scaleScratch = new THREE.Vector3(1, 1, 1);

function setStatus(text) {
  statusText.textContent = text;
}

function createRenderer() {
  try {
    const nextRenderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    nextRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    nextRenderer.outputColorSpace = THREE.SRGBColorSpace;
    return nextRenderer;
  } catch (error) {
    canvas.classList.add("is-unavailable");
    setStatus("WebGL unavailable in this browser. The real GLB catalog and downloads still work.");
    return null;
  }
}

function formatTags(asset) {
  const tags = [...(asset.tags || [])];
  if (asset.animated) {
    tags.unshift("animated");
  }

  return tags.join(" / ");
}

function frameModel(object, desiredSize = 1.18) {
  const box = new THREE.Box3().setFromObject(object);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);
  object.position.sub(center);

  const maxSize = Math.max(size.x, size.y, size.z) || 1;
  object.scale.setScalar(desiredSize / maxSize);
}

function clearStage() {
  mixers.length = 0;
  loadedSlots.clear();
  loadedCount = 0;
  modelSlots.clear();
}

function updateModelCopy(asset) {
  modelName.textContent = asset.name;
  modelMeta.textContent = `${asset.category} / ${formatTags(asset)}`;
  modelNotes.textContent = asset.notes;
  downloadLink.href = asset.downloadUrl || asset.file;
  downloadLink.download = asset.file.split("/").pop();
}

function selectAsset(asset) {
  activeAssetId = asset.id;
  updateModelCopy(asset);
  updateActiveCatalogCard();
  updateSceneFocus();

  if (!renderer) {
    setStatus("WebGL unavailable in this browser. Pick and download any real GLB asset below.");
    return;
  }

  if (loadedCount) {
    setStatus(`${loadedCount} real GLB models render together. Selected: ${asset.name}.`);
  }
}

function arrangeModelSlot(slot, index, total) {
  const columns = 4;
  const rows = Math.ceil(total / columns);
  const row = Math.floor(index / columns);
  const column = index % columns;
  const itemsInRow = row === rows - 1 ? total - row * columns : columns;
  const rowCenter = (itemsInRow - 1) / 2;
  const x = (column - rowCenter) * 3.35;
  const z = (row - (rows - 1) / 2) * 2.45;
  slot.position.set(x, -0.38, z);
  slot.userData.homeY = slot.position.y;
}

function loadModelSlot(asset, index) {
  return new Promise((resolve, reject) => {
    loader.load(
      asset.file,
      (gltf) => {
        const slot = new THREE.Group();
        slot.name = asset.id;
        slot.userData = {
          assetId: asset.id,
          spinSpeed: asset.animated ? 0.007 : 0.0035,
          targetScale: 1
        };

        const model = gltf.scene;
        model.traverse((node) => {
          if (node.isMesh && node.material) {
            node.material.side = THREE.DoubleSide;
          }
        });
        model.traverse((node) => {
          if (node.isMesh) {
            node.castShadow = false;
            node.receiveShadow = false;
          }
        });
        frameModel(model, asset.category === "prop" ? 1.02 : 1.2);
        slot.add(model);
        arrangeModelSlot(slot, index, assets.length);
        modelSlots.add(slot);
        loadedSlots.set(asset.id, slot);

        if (gltf.animations && gltf.animations.length) {
          const mixer = new THREE.AnimationMixer(model);
          gltf.animations.forEach((clip) => mixer.clipAction(clip).play());
          mixers.push(mixer);
        }

        resolve(slot);
      },
      undefined,
      reject
    );
  });
}

async function loadAllModels() {
  if (!renderer) {
    return;
  }

  clearStage();
  setStatus(`Loading ${assets.length} real GLB models into one stage...`);
  const results = await Promise.allSettled(assets.map((asset, index) => loadModelSlot(asset, index)));
  loadedCount = results.filter((result) => result.status === "fulfilled").length;
  if (loadedCount) {
    updateSceneFocus();
    const selected = assets.find((asset) => asset.id === activeAssetId);
    setStatus(`${loadedCount} real GLB models render together${selected ? `. Selected: ${selected.name}.` : "."}`);
    if (verifyMode) {
      renderFrame();
      window.setTimeout(captureCanvasProbe, 120);
    }
  } else {
    setStatus("GLB files failed to render. Downloads still work below.");
  }
}

function renderCatalog() {
  const shown = assets.filter((asset) => activeFilter === "all" || asset.category === activeFilter);
  catalog.innerHTML = "";
  count.textContent = String(assets.length);

  shown.forEach((asset, index) => {
    const article = document.createElement("article");
    article.className = `asset-card${asset.id === activeAssetId ? " is-active" : ""}`;
    article.innerHTML = `
      <button class="asset-preview" type="button" data-asset-id="${asset.id}">
        <span>${String(index + 1).padStart(2, "0")}</span>
        <strong>${asset.name}</strong>
        <small>${asset.category} / ${formatTags(asset)}</small>
      </button>
      <p>${asset.notes}</p>
      <a class="download-link" href="${asset.downloadUrl || asset.file}" download>Download GLB</a>
    `;
    catalog.appendChild(article);
  });

  catalog.querySelectorAll("[data-asset-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const asset = assets.find((item) => item.id === button.dataset.assetId);
      if (asset) {
        selectAsset(asset);
      }
    });
  });
}

function updateActiveCatalogCard() {
  catalog.querySelectorAll(".asset-card").forEach((card) => {
    const button = card.querySelector("[data-asset-id]");
    card.classList.toggle("is-active", button && button.dataset.assetId === activeAssetId);
  });
}

function updateSceneFocus() {
  loadedSlots.forEach((slot, assetId) => {
    slot.userData.targetScale = assetId === activeAssetId ? 1.28 : 1;
  });
}

function pickInitialAsset() {
  return (
    assets.find((asset) => asset.category === "character" && asset.animated) ||
    assets.find((asset) => asset.tags && asset.tags.includes("character")) ||
    assets.find((asset) => asset.category === "cute") ||
    assets[0]
  );
}

filters.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    filters.forEach((item) => item.classList.toggle("is-active", item === button));
    renderCatalog();
  });
});

canvas.addEventListener("pointerdown", (event) => {
  drag = true;
  lastX = event.clientX;
  canvas.setPointerCapture(event.pointerId);
});

canvas.addEventListener("pointerup", () => {
  drag = false;
});

canvas.addEventListener("pointermove", (event) => {
  if (!drag) {
    return;
  }
  targetRotationY += (event.clientX - lastX) * 0.008;
  lastX = event.clientX;
});

function resize() {
  if (!renderer) {
    return;
  }

  const rect = canvas.getBoundingClientRect();
  renderer.setSize(rect.width, rect.height, false);
  camera.aspect = rect.width / rect.height;
  camera.updateProjectionMatrix();
  camera.lookAt(cameraTarget);
}

function captureCanvasProbe() {
  if (!renderer) {
    return null;
  }

  const gl = renderer.getContext();
  const sampleWidth = Math.min(gl.drawingBufferWidth, 360);
  const sampleHeight = Math.min(gl.drawingBufferHeight, 220);
  const startX = Math.max(0, Math.floor((gl.drawingBufferWidth - sampleWidth) / 2));
  const startY = Math.max(0, Math.floor((gl.drawingBufferHeight - sampleHeight) / 2));
  const pixels = new Uint8Array(sampleWidth * sampleHeight * 4);
  gl.readPixels(startX, startY, sampleWidth, sampleHeight, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

  let brightPixels = 0;
  let alphaPixels = 0;
  const colorBuckets = new Set();
  for (let index = 0; index < pixels.length; index += 16) {
    const red = pixels[index];
    const green = pixels[index + 1];
    const blue = pixels[index + 2];
    const alpha = pixels[index + 3];
    if (alpha > 0) {
      alphaPixels += 1;
    }
    if (red + green + blue > 110) {
      brightPixels += 1;
    }
    colorBuckets.add(`${red >> 4}-${green >> 4}-${blue >> 4}-${alpha >> 6}`);
  }

  const probe = {
    expectedModels: assets.length,
    loadedModels: loadedCount,
    visibleSlots: loadedSlots.size,
    animatedMixers: mixers.length,
    canvasWidth: gl.drawingBufferWidth,
    canvasHeight: gl.drawingBufferHeight,
    brightPixels,
    alphaPixels,
    colorBuckets: colorBuckets.size,
    status: statusText.textContent
  };

  window.__qstyleProbe = probe;
  document.documentElement.dataset.qstyleLoadedModels = String(probe.loadedModels);
  document.documentElement.dataset.qstyleVisibleSlots = String(probe.visibleSlots);
  document.documentElement.dataset.qstyleAnimatedMixers = String(probe.animatedMixers);
  document.documentElement.dataset.qstyleColorBuckets = String(probe.colorBuckets);
  document.documentElement.dataset.qstyleBrightPixels = String(probe.brightPixels);
  return probe;
}

function renderFrame() {
  resize();
  const delta = clock.getDelta();
  mixers.forEach((mixer) => mixer.update(delta));
  modelSlots.rotation.y += (targetRotationY - modelSlots.rotation.y) * 0.06;
  loadedSlots.forEach((slot) => {
    slot.rotation.y += slot.userData.spinSpeed;
    const targetScale = slot.userData.targetScale || 1;
    scaleScratch.set(targetScale, targetScale, targetScale);
    slot.scale.lerp(scaleScratch, 0.08);
    slot.position.y += ((slot.userData.homeY || 0) + (targetScale > 1 ? 0.16 : 0) - slot.position.y) * 0.08;
  });
  if (!drag) {
    targetRotationY += 0.0009;
  }
  renderer.render(scene, camera);
}

function animate() {
  if (!renderer) {
    return;
  }

  renderFrame();
  if (verifyMode && window.__qstyleProbe && window.__qstyleProbe.loadedModels === assets.length) {
    return;
  }
  requestAnimationFrame(animate);
}

async function init() {
  renderer = createRenderer();
  filters[0].classList.add("is-active");
  const response = await fetch("models/manifest.json");
  const manifest = await response.json();
  assets = manifest.assets || [];
  renderCatalog();
  const initialAsset = pickInitialAsset();
  if (initialAsset) {
    selectAsset(initialAsset);
  }
  loadAllModels();

  if (renderer) {
    requestAnimationFrame(animate);
  }
}

init().catch(() => {
  setStatus("Model manifest failed to load.");
});
