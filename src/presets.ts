import * as THREE from "three";


export const PRESETS = {
  sphere:      { label: "Sphere" },
  box:         { label: "Box" },
  torus:       { label: "Torus" },
  torusKnot:   { label: "Torus Knot" },
  cone:        { label: "Cone" },
  cylinder:    { label: "Cylinder" },
} as const;

export type PresetName = keyof typeof PRESETS;

function mat(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.9,
    metalness: 0.2,
  });
}

const GROUND_Y = -1.1;

export function createPresetGeometry(name: PresetName): THREE.Mesh {
  let geo: THREE.BufferGeometry;
  let yOffset = 0; 

  switch (name) {
    case "sphere":
      geo = new THREE.SphereGeometry(1.1, 64, 32);
      yOffset = 1.1; 
      break;
    case "box":
      geo = new THREE.BoxGeometry(1.8, 1.8, 1.8);
      yOffset = 0.9;
      break;
    case "torus":
      geo = new THREE.TorusGeometry(0.9, 0.35, 48, 128);
      yOffset = 0.9; 
      break;
    case "torusKnot":
      geo = new THREE.TorusKnotGeometry(0.8, 0.28, 160, 32);
      yOffset = 1.1;
      break;
    case "cone":
      geo = new THREE.ConeGeometry(1, 2.2, 64);
      yOffset = 1.1; 
      break;
    case "cylinder":
      geo = new THREE.CylinderGeometry(0.8, 0.8, 2.0, 64);
      yOffset = 1.0; 
      break;
    default:
      geo = new THREE.SphereGeometry(1.1, 32, 16);
      yOffset = 1.1;
  }

  const mesh = new THREE.Mesh(geo, mat());
  mesh.position.y = GROUND_Y + yOffset;

  // Torus looks better on its side so the shadow reads clearly
  if (name === "torus") mesh.rotation.x = Math.PI / 2;

  mesh.castShadow    = true;
  mesh.receiveShadow = true;
  return mesh;
}