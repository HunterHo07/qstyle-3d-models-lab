import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const modelsDir = path.join(root, "models");

const palette = {
  cyan: [0.46, 0.96, 1.0, 1],
  gold: [1.0, 0.84, 0.48, 1],
  pink: [1.0, 0.5, 0.72, 1],
  mint: [0.64, 1.0, 0.7, 1],
  violet: [0.74, 0.66, 1.0, 1],
  coral: [1.0, 0.55, 0.4, 1],
  white: [0.95, 0.98, 1.0, 1],
  navy: [0.08, 0.16, 0.28, 1],
  steel: [0.55, 0.64, 0.75, 1],
  green: [0.22, 0.72, 0.43, 1]
};

const definitions = [
  {
    id: "spark-runner-mascot",
    name: "Spark Runner Mascot",
    category: "character",
    animated: true,
    tags: ["runner", "mascot"],
    notes: "Cute hero character with an embedded bounce animation for game or learning demos.",
    parts: [
      sphere("head", "cyan", [0, 1.65, 0], [0.58, 0.58, 0.58]),
      cylinder("body", "navy", [0, 0.78, 0], [0.48, 1.05, 0.48]),
      sphere("left-eye", "white", [-0.22, 1.76, 0.48], [0.08, 0.08, 0.08]),
      sphere("right-eye", "white", [0.22, 1.76, 0.48], [0.08, 0.08, 0.08]),
      cylinder("left-arm", "gold", [-0.62, 0.85, 0], [0.12, 0.9, 0.12], [0, 0, 0.45]),
      cylinder("right-arm", "gold", [0.62, 0.85, 0], [0.12, 0.9, 0.12], [0, 0, -0.45]),
      cylinder("left-leg", "coral", [-0.22, -0.18, 0], [0.14, 0.74, 0.14]),
      cylinder("right-leg", "coral", [0.22, -0.18, 0], [0.14, 0.74, 0.14]),
      cone("signal-cap", "gold", [0, 2.28, 0], [0.34, 0.62, 0.34])
    ]
  },
  {
    id: "mint-helper-bot",
    name: "Mint Helper Bot",
    category: "character",
    animated: true,
    tags: ["robot", "assistant"],
    notes: "Small assistant robot with a simple hover animation and reusable named mesh nodes.",
    parts: [
      box("screen-head", "mint", [0, 1.45, 0], [1.0, 0.68, 0.28]),
      box("body-core", "navy", [0, 0.55, 0], [0.82, 0.92, 0.5]),
      sphere("left-eye", "navy", [-0.2, 1.51, 0.18], [0.08, 0.08, 0.08]),
      sphere("right-eye", "navy", [0.2, 1.51, 0.18], [0.08, 0.08, 0.08]),
      cylinder("left-antenna", "gold", [-0.25, 1.98, 0], [0.04, 0.44, 0.04]),
      cylinder("right-antenna", "gold", [0.25, 1.98, 0], [0.04, 0.44, 0.04]),
      sphere("left-hand", "cyan", [-0.72, 0.68, 0], [0.18, 0.18, 0.18]),
      sphere("right-hand", "cyan", [0.72, 0.68, 0], [0.18, 0.18, 0.18]),
      cylinder("hover-ring", "steel", [0, -0.15, 0], [0.62, 0.08, 0.62])
    ]
  },
  {
    id: "pocket-dragon",
    name: "Pocket Dragon",
    category: "cute",
    animated: true,
    tags: ["dragon", "companion"],
    notes: "Compact cute dragon silhouette with wings, horns, tail, and idle motion.",
    parts: [
      sphere("body", "violet", [0, 0.55, 0], [0.78, 0.64, 0.9]),
      sphere("head", "violet", [0, 1.35, 0.34], [0.52, 0.48, 0.52]),
      cone("left-horn", "gold", [-0.25, 1.86, 0.25], [0.14, 0.38, 0.14]),
      cone("right-horn", "gold", [0.25, 1.86, 0.25], [0.14, 0.38, 0.14]),
      cone("left-wing", "cyan", [-0.78, 0.82, -0.12], [0.46, 0.92, 0.18], [0, 0, -0.7]),
      cone("right-wing", "cyan", [0.78, 0.82, -0.12], [0.46, 0.92, 0.18], [0, 0, 0.7]),
      cone("tail", "coral", [0, 0.38, -0.98], [0.28, 1.1, 0.28], [1.35, 0, 0])
    ]
  },
  {
    id: "star-mage-kid",
    name: "Star Mage Kid",
    category: "animated",
    animated: true,
    tags: ["character", "magic"],
    notes: "Animated learning-game character with a star wand and friendly Q-style proportions.",
    parts: [
      sphere("head", "pink", [0, 1.62, 0], [0.52, 0.52, 0.52]),
      cone("hat", "violet", [0, 2.2, 0], [0.42, 0.88, 0.42]),
      cylinder("robe", "navy", [0, 0.68, 0], [0.56, 1.08, 0.56]),
      cylinder("wand", "gold", [0.78, 1.02, 0.2], [0.04, 1.2, 0.04], [0, 0, -0.7]),
      sphere("wand-star", "gold", [1.12, 1.5, 0.2], [0.2, 0.2, 0.2]),
      cylinder("left-leg", "steel", [-0.18, -0.2, 0], [0.12, 0.66, 0.12]),
      cylinder("right-leg", "steel", [0.18, -0.2, 0], [0.12, 0.66, 0.12])
    ]
  },
  {
    id: "cloud-rabbit",
    name: "Cloud Rabbit",
    category: "cute",
    animated: false,
    tags: ["pet", "soft"],
    notes: "Cute rounded pet asset for assistant UI, onboarding, or classroom game scenes.",
    parts: [
      sphere("body", "white", [0, 0.52, 0], [0.76, 0.55, 0.64]),
      sphere("head", "white", [0, 1.2, 0.22], [0.48, 0.44, 0.46]),
      cylinder("left-ear", "pink", [-0.22, 1.78, 0.14], [0.12, 0.8, 0.1], [0.18, 0, -0.2]),
      cylinder("right-ear", "pink", [0.22, 1.78, 0.14], [0.12, 0.8, 0.1], [0.18, 0, 0.2]),
      sphere("tail", "cyan", [0, 0.65, -0.65], [0.22, 0.22, 0.22]),
      sphere("left-foot", "steel", [-0.28, 0.03, 0.34], [0.22, 0.12, 0.28]),
      sphere("right-foot", "steel", [0.28, 0.03, 0.34], [0.22, 0.12, 0.28])
    ]
  },
  {
    id: "neon-skate-bot",
    name: "Neon Skate Bot",
    category: "animated",
    animated: true,
    tags: ["robot", "vehicle"],
    notes: "Animated robot-rider style asset suitable for game lobby and arcade scenes.",
    parts: [
      box("bot-head", "cyan", [0, 1.55, 0], [0.62, 0.42, 0.36]),
      box("bot-body", "navy", [0, 0.82, 0], [0.58, 0.78, 0.42]),
      box("skateboard", "gold", [0, -0.16, 0.08], [1.5, 0.12, 0.5]),
      cylinder("front-wheel", "steel", [0.55, -0.32, 0.28], [0.16, 0.12, 0.16], [1.57, 0, 0]),
      cylinder("back-wheel", "steel", [-0.55, -0.32, 0.28], [0.16, 0.12, 0.16], [1.57, 0, 0]),
      sphere("left-hand", "pink", [-0.58, 0.82, 0.15], [0.16, 0.16, 0.16]),
      sphere("right-hand", "pink", [0.58, 0.82, 0.15], [0.16, 0.16, 0.16])
    ]
  },
  {
    id: "hover-scooter",
    name: "Hover Scooter",
    category: "vehicle",
    animated: false,
    tags: ["transport", "sci-fi"],
    notes: "Small hover vehicle prop for platform, hub, or marketplace 3D scenes.",
    parts: [
      box("deck", "cyan", [0, 0.25, 0], [1.8, 0.18, 0.58]),
      cylinder("front-engine", "gold", [0.74, 0.04, 0], [0.24, 0.38, 0.24], [1.57, 0, 0]),
      cylinder("back-engine", "gold", [-0.74, 0.04, 0], [0.24, 0.38, 0.24], [1.57, 0, 0]),
      cylinder("handle", "steel", [0.48, 0.94, 0], [0.05, 1.2, 0.05], [0, 0, -0.24]),
      box("control-bar", "steel", [0.62, 1.5, 0], [0.72, 0.08, 0.08])
    ]
  },
  {
    id: "cloud-delivery-cart",
    name: "Cloud Delivery Cart",
    category: "vehicle",
    animated: false,
    tags: ["cart", "delivery"],
    notes: "Cute delivery cart for item collection, economy, and tycoon scenes.",
    parts: [
      box("cart-body", "mint", [0, 0.45, 0], [1.45, 0.8, 0.9]),
      box("cargo-box", "gold", [0, 1.08, 0], [1.0, 0.48, 0.62]),
      cylinder("left-wheel-front", "steel", [0.52, -0.04, 0.52], [0.18, 0.16, 0.18], [1.57, 0, 0]),
      cylinder("left-wheel-back", "steel", [-0.52, -0.04, 0.52], [0.18, 0.16, 0.18], [1.57, 0, 0]),
      cylinder("right-wheel-front", "steel", [0.52, -0.04, -0.52], [0.18, 0.16, 0.18], [1.57, 0, 0]),
      cylinder("right-wheel-back", "steel", [-0.52, -0.04, -0.52], [0.18, 0.16, 0.18], [1.57, 0, 0])
    ]
  },
  {
    id: "rocket-booster-prop",
    name: "Rocket Booster Prop",
    category: "prop",
    animated: false,
    tags: ["rocket", "launch"],
    notes: "Reusable launch prop for startup, game reward, or achievement scenes.",
    parts: [
      cylinder("rocket-body", "white", [0, 0.8, 0], [0.34, 1.8, 0.34]),
      cone("rocket-nose", "coral", [0, 1.88, 0], [0.36, 0.7, 0.36]),
      cone("left-fin", "gold", [-0.34, 0.0, 0], [0.18, 0.5, 0.1], [0, 0, -0.45]),
      cone("right-fin", "gold", [0.34, 0.0, 0], [0.18, 0.5, 0.1], [0, 0, 0.45]),
      sphere("window", "cyan", [0, 1.25, 0.31], [0.14, 0.14, 0.06]),
      cone("flame", "gold", [0, -0.46, 0], [0.25, 0.7, 0.25], [3.14, 0, 0])
    ]
  },
  {
    id: "treasure-data-crate",
    name: "Treasure Data Crate",
    category: "prop",
    animated: false,
    tags: ["reward", "data"],
    notes: "Game-ready reward crate with glowing data orb detail.",
    parts: [
      box("crate-base", "navy", [0, 0.35, 0], [1.15, 0.7, 1.15]),
      box("crate-lid", "gold", [0, 0.82, 0], [1.28, 0.22, 1.28]),
      box("front-lock", "steel", [0, 0.54, 0.62], [0.3, 0.32, 0.08]),
      sphere("data-orb", "cyan", [0, 1.2, 0], [0.24, 0.24, 0.24])
    ]
  },
  {
    id: "mini-command-desk",
    name: "Mini Command Desk",
    category: "prop",
    animated: false,
    tags: ["dashboard", "desk"],
    notes: "Tiny control desk prop for operations, classroom, and software dashboard scenes.",
    parts: [
      box("desk-top", "navy", [0, 0.62, 0], [1.65, 0.18, 0.74]),
      box("screen-left", "cyan", [-0.38, 1.08, -0.22], [0.58, 0.48, 0.08]),
      box("screen-right", "mint", [0.38, 1.08, -0.22], [0.58, 0.48, 0.08]),
      cylinder("left-leg", "steel", [-0.58, 0.18, 0.22], [0.06, 0.72, 0.06]),
      cylinder("right-leg", "steel", [0.58, 0.18, 0.22], [0.06, 0.72, 0.06])
    ]
  },
  {
    id: "tiny-factory-friend",
    name: "Tiny Factory Friend",
    category: "cute",
    animated: false,
    tags: ["industrial", "mascot"],
    notes: "Friendly industrial mascot for factory, energy, and automation scenes.",
    parts: [
      box("body", "gold", [0, 0.75, 0], [0.82, 0.9, 0.62]),
      sphere("head", "white", [0, 1.45, 0.18], [0.38, 0.38, 0.38]),
      cylinder("chimney", "steel", [0.38, 1.28, -0.22], [0.12, 0.66, 0.12]),
      sphere("left-eye", "navy", [-0.14, 1.5, 0.5], [0.06, 0.06, 0.06]),
      sphere("right-eye", "navy", [0.14, 1.5, 0.5], [0.06, 0.06, 0.06]),
      cylinder("left-foot", "navy", [-0.26, 0.12, 0.12], [0.14, 0.22, 0.14]),
      cylinder("right-foot", "navy", [0.26, 0.12, 0.12], [0.14, 0.22, 0.14])
    ]
  },
  {
    id: "dance-console-bot",
    name: "Dance Console Bot",
    category: "animated",
    animated: true,
    tags: ["robot", "console"],
    notes: "Animated console robot with embedded loop for demo booths and game UI.",
    parts: [
      box("console-body", "violet", [0, 0.75, 0], [0.9, 0.9, 0.58]),
      sphere("display-face", "cyan", [0, 1.38, 0.3], [0.42, 0.3, 0.16]),
      cylinder("left-speaker", "gold", [-0.56, 0.74, 0.32], [0.16, 0.12, 0.16], [1.57, 0, 0]),
      cylinder("right-speaker", "gold", [0.56, 0.74, 0.32], [0.16, 0.12, 0.16], [1.57, 0, 0]),
      cylinder("left-leg", "steel", [-0.22, 0.03, 0], [0.1, 0.42, 0.1]),
      cylinder("right-leg", "steel", [0.22, 0.03, 0], [0.1, 0.42, 0.1])
    ]
  }
];

function box(name, color, translation, scale, rotation) {
  return { name, kind: "box", color, translation, scale, rotation };
}

function sphere(name, color, translation, scale, rotation) {
  return { name, kind: "sphere", color, translation, scale, rotation };
}

function cylinder(name, color, translation, scale, rotation) {
  return { name, kind: "cylinder", color, translation, scale, rotation };
}

function cone(name, color, translation, scale, rotation) {
  return { name, kind: "cone", color, translation, scale, rotation };
}

function pad4(value) {
  return (value + 3) & ~3;
}

function quatFromEuler([x = 0, y = 0, z = 0] = []) {
  const cx = Math.cos(x / 2), sx = Math.sin(x / 2);
  const cy = Math.cos(y / 2), sy = Math.sin(y / 2);
  const cz = Math.cos(z / 2), sz = Math.sin(z / 2);
  return [
    sx * cy * cz - cx * sy * sz,
    cx * sy * cz + sx * cy * sz,
    cx * cy * sz - sx * sy * cz,
    cx * cy * cz + sx * sy * sz
  ];
}

function createBoxGeometry() {
  const positions = [];
  const normals = [];
  const indices = [];
  const faces = [
    [[-0.5, -0.5, 0.5], [0.5, -0.5, 0.5], [0.5, 0.5, 0.5], [-0.5, 0.5, 0.5], [0, 0, 1]],
    [[0.5, -0.5, -0.5], [-0.5, -0.5, -0.5], [-0.5, 0.5, -0.5], [0.5, 0.5, -0.5], [0, 0, -1]],
    [[0.5, -0.5, 0.5], [0.5, -0.5, -0.5], [0.5, 0.5, -0.5], [0.5, 0.5, 0.5], [1, 0, 0]],
    [[-0.5, -0.5, -0.5], [-0.5, -0.5, 0.5], [-0.5, 0.5, 0.5], [-0.5, 0.5, -0.5], [-1, 0, 0]],
    [[-0.5, 0.5, 0.5], [0.5, 0.5, 0.5], [0.5, 0.5, -0.5], [-0.5, 0.5, -0.5], [0, 1, 0]],
    [[-0.5, -0.5, -0.5], [0.5, -0.5, -0.5], [0.5, -0.5, 0.5], [-0.5, -0.5, 0.5], [0, -1, 0]]
  ];
  for (const face of faces) {
    const base = positions.length / 3;
    for (let i = 0; i < 4; i++) {
      positions.push(...face[i]);
      normals.push(...face[4]);
    }
    indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
  }
  return { positions, normals, indices };
}

function createSphereGeometry(segments = 18, rings = 10) {
  const positions = [];
  const normals = [];
  const indices = [];
  for (let y = 0; y <= rings; y++) {
    const v = y / rings;
    const theta = v * Math.PI;
    for (let x = 0; x <= segments; x++) {
      const u = x / segments;
      const phi = u * Math.PI * 2;
      const nx = Math.sin(theta) * Math.cos(phi);
      const ny = Math.cos(theta);
      const nz = Math.sin(theta) * Math.sin(phi);
      positions.push(nx * 0.5, ny * 0.5, nz * 0.5);
      normals.push(nx, ny, nz);
    }
  }
  const row = segments + 1;
  for (let y = 0; y < rings; y++) {
    for (let x = 0; x < segments; x++) {
      const a = y * row + x;
      const b = a + row;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  return { positions, normals, indices };
}

function createCylinderGeometry(topRadius = 0.5, bottomRadius = 0.5, segments = 20) {
  const positions = [];
  const normals = [];
  const indices = [];
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const x = Math.cos(angle);
    const z = Math.sin(angle);
    positions.push(x * bottomRadius, -0.5, z * bottomRadius, x * topRadius, 0.5, z * topRadius);
    normals.push(x, 0, z, x, 0, z);
  }
  for (let i = 0; i < segments; i++) {
    const a = i * 2;
    indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
  }
  const bottomCenter = positions.length / 3;
  positions.push(0, -0.5, 0);
  normals.push(0, -1, 0);
  const topCenter = positions.length / 3;
  positions.push(0, 0.5, 0);
  normals.push(0, 1, 0);
  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const nextAngle = ((i + 1) / segments) * Math.PI * 2;
    const b0 = positions.length / 3;
    positions.push(Math.cos(angle) * bottomRadius, -0.5, Math.sin(angle) * bottomRadius);
    positions.push(Math.cos(nextAngle) * bottomRadius, -0.5, Math.sin(nextAngle) * bottomRadius);
    normals.push(0, -1, 0, 0, -1, 0);
    indices.push(bottomCenter, b0 + 1, b0);

    if (topRadius > 0) {
      const t0 = positions.length / 3;
      positions.push(Math.cos(angle) * topRadius, 0.5, Math.sin(angle) * topRadius);
      positions.push(Math.cos(nextAngle) * topRadius, 0.5, Math.sin(nextAngle) * topRadius);
      normals.push(0, 1, 0, 0, 1, 0);
      indices.push(topCenter, t0, t0 + 1);
    }
  }
  return { positions, normals, indices };
}

function geometryFor(kind) {
  if (kind === "box") return createBoxGeometry();
  if (kind === "sphere") return createSphereGeometry();
  if (kind === "cone") return createCylinderGeometry(0, 0.5, 20);
  return createCylinderGeometry();
}

function minMax(values, stride) {
  const min = Array(stride).fill(Infinity);
  const max = Array(stride).fill(-Infinity);
  for (let i = 0; i < values.length; i += stride) {
    for (let j = 0; j < stride; j++) {
      min[j] = Math.min(min[j], values[i + j]);
      max[j] = Math.max(max[j], values[i + j]);
    }
  }
  return { min, max };
}

function createGlb(asset) {
  const gltf = {
    asset: { version: "2.0", generator: "Hunter Ho Q-Style GLB generator" },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ name: asset.id, children: [] }],
    meshes: [],
    materials: [],
    accessors: [],
    bufferViews: [],
    buffers: [{ byteLength: 0 }]
  };
  const chunks = [];
  const materialMap = new Map();

  function pushBuffer(typedArray, target) {
    const raw = Buffer.from(typedArray.buffer, typedArray.byteOffset, typedArray.byteLength);
    const padded = Buffer.alloc(pad4(raw.length));
    raw.copy(padded);
    const byteOffset = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    chunks.push(padded);
    const viewIndex = gltf.bufferViews.length;
    gltf.bufferViews.push({ buffer: 0, byteOffset, byteLength: raw.length, target });
    return viewIndex;
  }

  function addAccessor(values, type, componentType, target, stride) {
    const typedArray = componentType === 5123 ? new Uint16Array(values) : new Float32Array(values);
    const bufferView = pushBuffer(typedArray, target);
    const accessor = {
      bufferView,
      componentType,
      count: values.length / stride,
      type
    };
    if (componentType === 5126 || type === "SCALAR") {
      Object.assign(accessor, minMax(values, stride));
    }
    const accessorIndex = gltf.accessors.length;
    gltf.accessors.push(accessor);
    return accessorIndex;
  }

  function materialIndex(colorName) {
    if (materialMap.has(colorName)) {
      return materialMap.get(colorName);
    }
    const color = palette[colorName] || palette.cyan;
    const index = gltf.materials.length;
    gltf.materials.push({
      name: `${colorName}-pbr`,
      pbrMetallicRoughness: {
        baseColorFactor: color,
        roughnessFactor: 0.58,
        metallicFactor: colorName === "steel" ? 0.55 : 0.08
      },
      emissiveFactor: colorName === "cyan" ? [0.04, 0.16, 0.2] : [0, 0, 0]
    });
    materialMap.set(colorName, index);
    return index;
  }

  for (const part of asset.parts) {
    const geometry = geometryFor(part.kind);
    const position = addAccessor(geometry.positions, "VEC3", 5126, 34962, 3);
    const normal = addAccessor(geometry.normals, "VEC3", 5126, 34962, 3);
    const indices = addAccessor(geometry.indices, "SCALAR", 5123, 34963, 1);
    const meshIndex = gltf.meshes.length;
    gltf.meshes.push({
      name: `${asset.id}-${part.name}-mesh`,
      primitives: [{ attributes: { POSITION: position, NORMAL: normal }, indices, material: materialIndex(part.color) }]
    });
    const nodeIndex = gltf.nodes.length;
    const node = {
      name: `${asset.id}-${part.name}`,
      mesh: meshIndex,
      translation: part.translation,
      scale: part.scale
    };
    if (part.rotation) {
      node.rotation = quatFromEuler(part.rotation);
    }
    gltf.nodes.push(node);
    gltf.nodes[0].children.push(nodeIndex);
  }

  if (asset.animated) {
    const times = [0, 0.45, 0.9, 1.35, 1.8];
    const translations = [
      0, 0, 0,
      0, 0.16, 0,
      0, 0, 0,
      0, -0.05, 0,
      0, 0, 0
    ];
    const input = addAccessor(times, "SCALAR", 5126, undefined, 1);
    const output = addAccessor(translations, "VEC3", 5126, undefined, 3);
    gltf.animations = [{
      name: `${asset.name} idle bounce`,
      samplers: [{ input, output, interpolation: "LINEAR" }],
      channels: [{ sampler: 0, target: { node: 0, path: "translation" } }]
    }];
  }

  const bin = Buffer.concat(chunks);
  gltf.buffers[0].byteLength = bin.length;
  const json = Buffer.from(JSON.stringify(gltf));
  const jsonPadded = Buffer.alloc(pad4(json.length), 0x20);
  json.copy(jsonPadded);
  const binPadded = Buffer.alloc(pad4(bin.length));
  bin.copy(binPadded);
  const header = Buffer.alloc(12);
  const jsonHeader = Buffer.alloc(8);
  const binHeader = Buffer.alloc(8);
  const length = 12 + 8 + jsonPadded.length + 8 + binPadded.length;
  header.write("glTF", 0);
  header.writeUInt32LE(2, 4);
  header.writeUInt32LE(length, 8);
  jsonHeader.writeUInt32LE(jsonPadded.length, 0);
  jsonHeader.write("JSON", 4);
  binHeader.writeUInt32LE(binPadded.length, 0);
  binHeader.write("BIN\0", 4);
  return Buffer.concat([header, jsonHeader, jsonPadded, binHeader, binPadded]);
}

async function main() {
  await fs.rm(modelsDir, { recursive: true, force: true });
  await fs.mkdir(modelsDir, { recursive: true });

  const manifest = {
    generatedAt: new Date().toISOString(),
    format: "glb",
    assets: []
  };

  for (const definition of definitions) {
    const file = `models/${definition.id}.glb`;
    await fs.writeFile(path.join(root, file), createGlb(definition));
    manifest.assets.push({
      id: definition.id,
      name: definition.name,
      category: definition.category,
      animated: definition.animated,
      tags: definition.tags,
      file,
      downloadUrl: file,
      notes: definition.notes,
      engineCompatibility: ["three.js", "babylon.js", "model-viewer"],
      scale: "meters-ish, centered around origin",
      status: "portfolio-ready"
    });
  }

  await fs.writeFile(path.join(modelsDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
}

await main();
