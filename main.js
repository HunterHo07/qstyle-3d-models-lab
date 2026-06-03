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

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 1000);
camera.position.set(4.8, 3.2, 8.4);

const modelRoot = new THREE.Group();
scene.add(modelRoot);
scene.add(new THREE.AmbientLight(0xffffff, 0.86));

const key = new THREE.DirectionalLight(0x9ff7ff, 2.1);
key.position.set(5, 8, 7);
scene.add(key);

const rim = new THREE.DirectionalLight(0xffd78a, 1.45);
rim.position.set(-5, 4, -4);
scene.add(rim);

const floor = new THREE.Mesh(
  new THREE.CylinderGeometry(2.8, 3.1, 0.12, 48),
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

const loader = new GLTFLoader();
const clock = new THREE.Clock();
const mixers = [];
let assets = [];
let activeFilter = "all";
let currentModel = null;
let drag = false;
let lastX = 0;
let targetRotationY = 0;

function setStatus(text) {
  statusText.textContent = text;
}

function formatTags(asset) {
  const tags = [...(asset.tags || [])];
  if (asset.animated) {
    tags.unshift("animated");
  }

  return tags.join(" / ");
}

function frameModel(object) {
  const box = new THREE.Box3().setFromObject(object);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);
  object.position.sub(center);

  const maxSize = Math.max(size.x, size.y, size.z) || 1;
  object.scale.setScalar(3.8 / maxSize);
}

function clearModel() {
  mixers.length = 0;
  modelRoot.clear();
  currentModel = null;
}

function updateModelCopy(asset) {
  modelName.textContent = asset.name;
  modelMeta.textContent = `${asset.category} / ${formatTags(asset)}`;
  modelNotes.textContent = asset.notes;
  downloadLink.href = asset.downloadUrl || asset.file;
  downloadLink.download = asset.file.split("/").pop();
}

async function loadModel(asset) {
  clearModel();
  updateModelCopy(asset);
  setStatus("Loading real GLB asset...");

  loader.load(
    asset.file,
    (gltf) => {
      currentModel = gltf.scene;
      currentModel.traverse((node) => {
        if (node.isMesh) {
          node.castShadow = false;
          node.receiveShadow = false;
        }
      });
      frameModel(currentModel);
      modelRoot.add(currentModel);

      if (gltf.animations && gltf.animations.length) {
        const mixer = new THREE.AnimationMixer(currentModel);
        gltf.animations.forEach((clip) => mixer.clipAction(clip).play());
        mixers.push(mixer);
        setStatus("Animation playing from embedded GLB clip.");
      } else {
        setStatus("Static GLB loaded. Drag to rotate.");
      }
    },
    undefined,
    () => {
      setStatus("This model failed to load. Try another asset.");
    }
  );
}

function renderCatalog() {
  const shown = assets.filter((asset) => activeFilter === "all" || asset.category === activeFilter);
  catalog.innerHTML = "";
  count.textContent = String(assets.length);

  shown.forEach((asset, index) => {
    const article = document.createElement("article");
    article.className = "asset-card";
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
        loadModel(asset);
      }
    });
  });
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
  const rect = canvas.getBoundingClientRect();
  renderer.setSize(rect.width, rect.height, false);
  camera.aspect = rect.width / rect.height;
  camera.updateProjectionMatrix();
}

function animate() {
  resize();
  const delta = clock.getDelta();
  mixers.forEach((mixer) => mixer.update(delta));
  modelRoot.rotation.y += (targetRotationY - modelRoot.rotation.y) * 0.08;
  if (!drag) {
    targetRotationY += 0.003;
  }
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

async function init() {
  filters[0].classList.add("is-active");
  const response = await fetch("models/manifest.json");
  const manifest = await response.json();
  assets = manifest.assets || [];
  renderCatalog();
  if (assets[0]) {
    loadModel(assets[0]);
  }
  requestAnimationFrame(animate);
}

init().catch(() => {
  setStatus("Model manifest failed to load.");
});
