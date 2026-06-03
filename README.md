# Q-Style 3D Models Lab

Assets 3 is a real browser GLB catalog for the portfolio. It loads local `.glb` files from `models/manifest.json`, previews them with Three.js `GLTFLoader`, plays embedded animation clips with `AnimationMixer`, and exposes direct download links.

This replaces the old procedural-only demo. The old version generated 200 shapes at runtime but did not provide reusable model files.

## Asset source

The current asset set is custom code-generated GLB output from `scripts/generate-glb-assets.mjs`.

- Files: `models/*.glb`
- Manifest: `models/manifest.json`
- Categories: characters, cute mascots, animated models, props, and vehicles
- Format: embedded binary `.glb`, no external texture dependency

## Run locally

```bash
python3 -m http.server 8088
```

Then open `http://127.0.0.1:8088`.

## Verify

```bash
node tests/qstyle-assets.test.js
```
