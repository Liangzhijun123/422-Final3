// src/ModelLoader.ts

import * as THREE from "three";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export class ModelLoader {
  public root?: THREE.Object3D;

  static async load(
    url: string,
    scene: THREE.Scene
  ): Promise<ModelLoader> {
    const model = new ModelLoader();
    const loader = new GLTFLoader();

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath(
      "https://www.gstatic.com/draco/v1/decoders/"
    );    
    loader.setDRACOLoader( dracoLoader );

    const gltf = await loader.loadAsync(url);

    model.root = gltf.scene;
    scene.add(gltf.scene);

    console.log("Loaded model objects:");

    gltf.scene.traverse((child) => {
      console.log({
        name: child.name,
        type: child.type,
        visible: child.visible,
      });
    });

    return model;
  }

  public getObject(name: string) {
    return this.root?.getObjectByName(name);
  }
}