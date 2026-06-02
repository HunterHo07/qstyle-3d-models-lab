import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

const canvas = document.getElementById("scene");
const catalog = document.getElementById("catalog");
const filters = document.querySelectorAll("[data-filter]");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
camera.position.set(0, 30, 68);
const group = new THREE.Group();
scene.add(group);
scene.add(new THREE.AmbientLight(0xffffff, .7));
const key = new THREE.DirectionalLight(0x9ff7ff, 2.2); key.position.set(20, 40, 24); scene.add(key);
const gold = new THREE.PointLight(0xffd78a, 2, 120); gold.position.set(-28, 24, 28); scene.add(gold);

const families = ["character", "dragon", "weapon", "land", "prop"];
const palette = [0x75f4ff, 0xffd78a, 0xff83b6, 0xa6ffb5, 0xbba8ff, 0xff8b68];
const assets = [];
for (let i = 0; i < 200; i++) assets.push({ id: i + 1, family: families[i % families.length], color: palette[i % palette.length] });

function mat(color, rough = .54) { return new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: .18 }); }
function mesh(geometry, material, x, y, z, s = 1) { const m = new THREE.Mesh(geometry, material); m.position.set(x, y, z); m.scale.setScalar(s); return m; }
function buildAsset(asset, index) {
  const g = new THREE.Group();
  const m = mat(asset.color);
  if (asset.family === "character") {
    g.add(mesh(new THREE.SphereGeometry(.9, 18, 18), m, 0, 1.9, 0));
    g.add(mesh(new THREE.CapsuleGeometry(.72, 1.15, 6, 14), m, 0, .7, 0));
    g.add(mesh(new THREE.ConeGeometry(.34, .9, 4), mat(0xffffff), -.38, 2.82, 0));
    g.add(mesh(new THREE.ConeGeometry(.34, .9, 4), mat(0xffffff), .38, 2.82, 0));
  } else if (asset.family === "dragon") {
    g.add(mesh(new THREE.SphereGeometry(.9, 18, 18), m, 0, 1.3, 0));
    g.add(mesh(new THREE.ConeGeometry(.55, 1.3, 3), m, -1.05, 1.3, 0, 1.2));
    g.add(mesh(new THREE.ConeGeometry(.55, 1.3, 3), m, 1.05, 1.3, 0, 1.2));
    g.add(mesh(new THREE.ConeGeometry(.18, .9, 8), mat(0xfff2d0), -.25, 2.12, .2));
    g.add(mesh(new THREE.ConeGeometry(.18, .9, 8), mat(0xfff2d0), .25, 2.12, .2));
  } else if (asset.family === "weapon") {
    g.add(mesh(new THREE.CylinderGeometry(.08, .08, 2.8, 12), mat(0xcfd9e7), 0, 1.3, 0));
    g.add(mesh(new THREE.BoxGeometry(1.2, .18, .18), mat(asset.color), 0, 1.2, 0));
    g.add(mesh(new THREE.ConeGeometry(.32, .9, 4), mat(0xffffff), 0, 2.96, 0));
  } else if (asset.family === "land") {
    g.add(mesh(new THREE.CylinderGeometry(1.35, 1.55, .72, 6), mat(asset.color), 0, .42, 0));
    g.add(mesh(new THREE.ConeGeometry(.52, 1.2, 7), mat(0x2f8a62), -.52, 1.42, 0));
    g.add(mesh(new THREE.ConeGeometry(.42, 1.0, 7), mat(0x79d39f), .55, 1.26, .1));
  } else {
    g.add(mesh(new THREE.BoxGeometry(1.5, 1.2, 1.5), m, 0, .9, 0));
    g.add(mesh(new THREE.SphereGeometry(.46, 16, 16), mat(0xffd78a), .55, 1.68, .55));
  }
  const col = index % 20, row = Math.floor(index / 20);
  g.position.set((col - 9.5) * 3.2, 0, (row - 4.5) * 4.2);
  g.rotation.y = (index % 7) * .18;
  g.userData.family = asset.family;
  group.add(g);
}

assets.forEach(buildAsset);
function renderCatalog(filter = "all") {
  catalog.innerHTML = "";
  assets.filter(a => filter === "all" || a.family === filter).slice(0, 25).forEach(a => {
    const article = document.createElement("article");
    article.innerHTML = `<strong>#${String(a.id).padStart(3, "0")} ${a.family}</strong><span>Procedural Q-style model, WebGL-ready grouping, browser catalog preview.</span>`;
    catalog.appendChild(article);
  });
  group.children.forEach(child => child.visible = filter === "all" || child.userData.family === filter);
}
filters.forEach(button => button.addEventListener("click", () => { filters.forEach(b => b.classList.remove("is-active")); button.classList.add("is-active"); renderCatalog(button.dataset.filter); }));
filters[0].classList.add("is-active");
renderCatalog();

let drag = false, lastX = 0;
canvas.addEventListener("pointerdown", e => { drag = true; lastX = e.clientX; });
window.addEventListener("pointerup", () => drag = false);
window.addEventListener("pointermove", e => { if (drag) { group.rotation.y += (e.clientX - lastX) * .006; lastX = e.clientX; } });

function resize() { const rect = canvas.getBoundingClientRect(); renderer.setSize(rect.width, rect.height, false); camera.aspect = rect.width / rect.height; camera.updateProjectionMatrix(); }
function animate(time) { resize(); group.rotation.y += .0018; group.children.forEach((m, i) => { m.position.y = Math.sin(time * .0015 + i) * .08; }); renderer.render(scene, camera); requestAnimationFrame(animate); }
requestAnimationFrame(animate);
