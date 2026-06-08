import * as THREE from "three";
import GUI from "lil-gui";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Post } from "./Post";
import { ModelLoader } from "./ModelLoader";
import { type PresetName, createPresetGeometry, PRESETS } from "./presets";

// Renderer 
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x000000, 0);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

//Scene / Camera 
const scene = new THREE.Scene();

const aspect = window.innerWidth / window.innerHeight;
const frustumSize = 6;
const zoom = 3;

const camera = new THREE.OrthographicCamera(
  (-frustumSize * aspect) / 2,
  (frustumSize * aspect) / 2,
  frustumSize / 2,
  -frustumSize / 2,
  0.1,
  100
);
camera.position.set(0, 3, 4);
camera.lookAt(0, 1, 0);

//Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

//Lights
const keyLight = new THREE.DirectionalLight(0xfff5e0, 3.0); // warm white
keyLight.position.set(-3, 5, 4);
keyLight.castShadow = true;
keyLight.shadow.bias        = -0.0002;
keyLight.shadow.normalBias  =  0.02;
keyLight.shadow.mapSize.set(2048, 2048);
keyLight.shadow.camera.near =  1;
keyLight.shadow.camera.far  = 20;
keyLight.shadow.camera.left = keyLight.shadow.camera.bottom = -5;
keyLight.shadow.camera.right = keyLight.shadow.camera.top  =  5;
scene.add(keyLight);



const ambientLight = new THREE.AmbientLight(0xffffff, 0.15);
scene.add(ambientLight);


// Ground plane to see shadows
const groundGeo = new THREE.PlaneGeometry(5, 5);
const groundMat = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  roughness: 1,
  metalness: 0,
});

const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -1.1; 
ground.receiveShadow = true;
scene.add(ground);


// Scene content 
let currentMesh: THREE.Object3D | null = null;

function clearScene() {
  if (currentMesh) {
    scene.remove(currentMesh);
    currentMesh = null;
  }
}

function loadPreset(name: PresetName) {
  clearScene();
  const mesh = createPresetGeometry(name);
  scene.add(mesh);
  currentMesh = mesh;
}

async function loadGLTF(file: File) {
  clearScene();
  const url = URL.createObjectURL(file);
  try {
    const loader = new ModelLoader();
    const root = await loader.loadFromUrl(url, scene);
    currentMesh = root;
  } finally {
    URL.revokeObjectURL(url);
  }
}

loadPreset("torusKnot");

// Post processing (Loading main shader)
const post = new Post(renderer);
post.setSize(window.innerWidth, window.innerHeight);

const paperTexture = new THREE.DataTexture(
  new Uint8Array([255, 255, 255, 255]),
  1,
  1
);
/** Can load a paper texture like this:
 *  const paperTexture2 = new THREE.TextureLoader().load(
      "./paper3.png",
      (tex) => {
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      }
    );
 */
paperTexture.needsUpdate = true;
post.setPaperTexture(paperTexture);

// GUI 
const gui = new GUI({ title: "Hatch Shader" });

// Scene controls
const sceneFolder = gui.addFolder("Scene");

const presetState = { preset: "torusKnot" as PresetName };
sceneFolder
  .add(presetState, "preset", Object.keys(PRESETS))
  .name("Geometry preset")
  .onChange((v: PresetName) => loadPreset(v));

const uploadState = { upload: () => fileInput.click() };
sceneFolder.add(uploadState, "upload").name("Upload GLB / GLTF…");

// Shader controls
post.generateParams(gui);

const fileInput = document.createElement("input");
fileInput.type = "file";
fileInput.accept = ".glb,.gltf";
fileInput.style.display = "none";
document.body.appendChild(fileInput);

fileInput.addEventListener("change", async () => {
  const file = fileInput.files?.[0];
  if (!file) return;
  fileInput.value = "";
  await loadGLTF(file);
});


window.addEventListener("resize", () => {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const a = w / h;

  (camera as THREE.OrthographicCamera).left = -a * zoom;
  (camera as THREE.OrthographicCamera).right = a * zoom;
  (camera as THREE.OrthographicCamera).top = zoom;
  (camera as THREE.OrthographicCamera).bottom = -zoom;
  camera.updateProjectionMatrix();

  renderer.setSize(w, h);
  post.setSize(w, h);
});

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  post.render(scene, camera);
}
animate();