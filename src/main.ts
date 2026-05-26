import * as THREE from "three";
import GUI from "lil-gui";
import { Post } from "./Post";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ModelLoader } from "./ModelLoader";

// ── Renderer ──────────────────────────────────────────────────────────────────
// alpha: true so the canvas itself is transparent if needed
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x000000, 0); // transparent clear by default
document.body.style.margin = "0";
document.body.appendChild(renderer.domElement);

// ── Scene / Camera ────────────────────────────────────────────────────────────
const scene = new THREE.Scene();

// Isometric camera — swap for PerspectiveCamera if you prefer
const aspect = window.innerWidth / window.innerHeight;
  const frustumSize = 6;

const zoom   = 3; // world-units visible from centre; increase to zoom out
  const camera =
    new THREE.OrthographicCamera(
      (-frustumSize * aspect) / 2,
      (frustumSize * aspect) / 2,
      frustumSize / 2,
      -frustumSize / 2,
      0.1,
      100
    );

  camera.position.set(0, 3, 4);
  camera.lookAt(0, 1, 0);
  

// -- Controls

const controls = new OrbitControls(
  camera,
  renderer.domElement
);



// ── Lights ────────────────────────────────────────────────────────────────────
   const pointLightMain =
    new THREE.PointLight(
      "0xffffff",
      50
    );

  pointLightMain.position.set(-1, 2, 5);
  pointLightMain.castShadow = true;

  scene.add(pointLightMain);
       


  
  const dirLight = new THREE.DirectionalLight(0xffffff, 4.5);

dirLight.position.set(-1, 2, 5);
dirLight.castShadow = true;

dirLight.shadow.bias = -0.0002;
dirLight.shadow.normalBias = 0.01 ;
dirLight.shadow.mapSize.set(2048, 2048);
scene.add(dirLight);

// ── Mesh ──────────────────────────────────────────────────────────────────────
const room = await ModelLoader.load('/Room5.glb', scene)

// ── Post ──────────────────────────────────────────────────────────────────────
const post = new Post(renderer);
post.setSize(window.innerWidth, window.innerHeight);

// Option A: real paper texture
// const paperTexture = new THREE.TextureLoader().load("./assets/paper.png");
// post.setPaperTexture(paperTexture);

// Option B: plain white fallback (no file needed)
const paperTexture = new THREE.DataTexture(
  new Uint8Array([255, 255, 255, 255]), 1, 1
);
paperTexture.needsUpdate = true;
post.setPaperTexture(paperTexture);

// ── GUI ───────────────────────────────────────────────────────────────────────
const gui = new GUI();
post.generateParams(gui);

// ── Resize ────────────────────────────────────────────────────────────────────
window.addEventListener("resize", () => {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const a = w / h;

  // Update orthographic camera bounds on resize
  (camera as THREE.OrthographicCamera).left   = -a * zoom;
  (camera as THREE.OrthographicCamera).right  =  a * zoom;
  (camera as THREE.OrthographicCamera).top    =  zoom;
  (camera as THREE.OrthographicCamera).bottom = -zoom;
  camera.updateProjectionMatrix();

  renderer.setSize(w, h);
  post.setSize(w, h);
});

// ── Loop ──────────────────────────────────────────────────────────────────────
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  post.render(scene, camera);
}
animate();