import * as THREE from "three";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export class ModelLoader {
  public root?: THREE.Object3D;

  private static buildLoader(): GLTFLoader {
    const loader = new GLTFLoader();
    const draco = new DRACOLoader();
    draco.setDecoderPath("https://www.gstatic.com/draco/v1/decoders/");
    loader.setDRACOLoader(draco);
    return loader;
  }

  async loadFromUrl(url: string, scene: THREE.Scene): Promise<THREE.Object3D> {
    const loader = ModelLoader.buildLoader();
    const gltf = await loader.loadAsync(url);
    this.root = gltf.scene;
    scene.add(gltf.scene);
    return gltf.scene;
  }

  async loadFromFile(file: File, scene: THREE.Scene): Promise<THREE.Object3D> {
    const url = URL.createObjectURL(file);
    try {
      return await this.loadFromUrl(url, scene);
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  getObject(name: string): THREE.Object3D | undefined {
    return this.root?.getObjectByName(name);
  }
}