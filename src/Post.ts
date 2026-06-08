import {
  BufferAttribute,
  BufferGeometry,
  Camera,
  Color,
  DataTexture,
  DoubleSide,
  GLSL3,
  LinearFilter,
  Mesh,
  MeshNormalMaterial,
  OrthographicCamera,
  RawShaderMaterial,
  RGBAFormat,
  RepeatWrapping,
  Scene,
  Texture,
  TextureLoader,
  UnsignedByteType,
  WebGLRenderer,
  WebGLRenderTarget,
} from "three";
import GUI from "lil-gui";

// ---------------------------------------------------------------------------
// Vertex shader
// ---------------------------------------------------------------------------
const orthoVs = /* glsl */ `
precision highp float;
in vec3 position;
in vec2 uv;
out vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

// ---------------------------------------------------------------------------
// Shader chunks
// ---------------------------------------------------------------------------
const chunkSobel = /* glsl */ `
vec4 sobel(sampler2D tex, vec2 uv, vec2 size, float thickness) {
  vec2 texel = thickness / size;
  vec4 h = vec4(0.);
  h += texture(tex, uv + texel * vec2(-1.,-1.)) * -1.;
  h += texture(tex, uv + texel * vec2( 0.,-1.)) * -2.;
  h += texture(tex, uv + texel * vec2( 1.,-1.)) * -1.;
  h += texture(tex, uv + texel * vec2(-1., 1.)) *  1.;
  h += texture(tex, uv + texel * vec2( 0., 1.)) *  2.;
  h += texture(tex, uv + texel * vec2( 1., 1.)) *  1.;
  vec4 v = vec4(0.);
  v += texture(tex, uv + texel * vec2(-1.,-1.)) * -1.;
  v += texture(tex, uv + texel * vec2(-1., 0.)) * -2.;
  v += texture(tex, uv + texel * vec2(-1., 1.)) * -1.;
  v += texture(tex, uv + texel * vec2( 1.,-1.)) *  1.;
  v += texture(tex, uv + texel * vec2( 1., 0.)) *  2.;
  v += texture(tex, uv + texel * vec2( 1., 1.)) *  1.;
  return sqrt(h * h + v * v);
}
`;

const chunkAastep = /* glsl */ `
float aastep(float threshold, float value) {
  float afwidth = length(vec2(dFdx(value), dFdy(value))) * 0.70710678118654752440;
  return smoothstep(threshold - afwidth, threshold + afwidth, value);
}
`;

const chunkLuma = /* glsl */ `
float luma(vec3 color) {
  return dot(color, vec3(0.299, 0.587, 0.114));
}
`;

const chunkBlendDarken = /* glsl */ `
vec3 blendDarken(vec3 base, vec3 blend, float opacity) {
  return mix(base, min(base, blend), opacity);
}
`;

// ---------------------------------------------------------------------------
// Fragment shader
// ---------------------------------------------------------------------------
const fragmentShader = /* glsl */ `
precision highp float;

uniform sampler2D colorTexture;
uniform sampler2D normalTexture;
uniform sampler2D paperTexture;
uniform sampler2D noiseTexture;

uniform vec3  inkColor;
uniform float scale;
uniform float thickness;
uniform float intensity;
uniform float noisiness;
uniform float angle;
uniform bool  hatchBackground;

uniform vec3  edgeColor;
uniform float edgeThickness;
uniform float edgeStrength;

uniform float paperScale;
uniform float lineSpacing;
uniform vec3  lineColor;
uniform float lineOpacity;
uniform vec3  marginColor;
uniform float marginPosition;
uniform float marginOpacity;
uniform float paperOpacity;

uniform int debugMode;

out vec4 fragColor;
in  vec2 vUv;

${chunkSobel}
${chunkLuma}
${chunkAastep}
${chunkBlendDarken}

float stripe(in vec2 uv, in float freq) {
  float v = .5 + .5 * sin(uv.y * freq);
  return smoothstep(0., thickness, v);
}

vec2 distortUV(in vec2 uv, in vec2 nUV, in float sc, in float offset) {
  vec2 noise = texture(noiseTexture, nUV * sc + vec2(offset, 0.)).xy;
  uv += (-1.0 + noise * 2.0) * intensity;
  return uv;
}

vec2 warpUv(in vec2 uv, in float sc, in float offset) {
  vec2 nUV = uv;
  vec2 ruv = uv;
  ruv = distortUV(ruv, nUV,                          sc, offset);
  ruv = distortUV(ruv, vec2(nUV.x+0.1, nUV.y+0.1),  sc, offset);
  ruv = distortUV(ruv, vec2(nUV.x+0.2, nUV.y+0.2),  sc, offset);
  ruv = distortUV(ruv, vec2(nUV.x+0.3, nUV.y+0.3),  sc, offset);
  ruv = distortUV(ruv, vec2(nUV.x+0.4, nUV.y+0.4),  sc, offset);
  ruv = distortUV(ruv, vec2(nUV.x+0.5, nUV.y+0.5),  sc, offset);
  ruv = distortUV(ruv, vec2(nUV.x+0.6, nUV.y+0.6),  sc, offset);
  ruv = distortUV(ruv, vec2(nUV.x+0.7, nUV.y+0.7),  sc, offset);
  ruv = distortUV(ruv, vec2(nUV.x+0.8, nUV.y+0.8),  sc, offset);
  ruv = distortUV(ruv, vec2(nUV.x+0.9, nUV.y+0.9),  sc, offset);
  ruv = distortUV(ruv, vec2(nUV.x+0.15,nUV.y+0.15), sc, offset);
  ruv = distortUV(ruv, vec2(nUV.x+0.25,nUV.y+0.25), sc, offset);
  ruv = distortUV(ruv, vec2(nUV.x+0.35,nUV.y+0.35), sc, offset);
  ruv = distortUV(ruv, vec2(nUV.x+0.45,nUV.y+0.45), sc, offset);
  ruv = distortUV(ruv, vec2(nUV.x+0.55,nUV.y+0.55), sc, offset);
  ruv = distortUV(ruv, vec2(nUV.x+0.65,nUV.y+0.65), sc, offset);
  ruv = distortUV(ruv, vec2(nUV.x+0.75,nUV.y+0.75), sc, offset);
  ruv = distortUV(ruv, vec2(nUV.x+0.85,nUV.y+0.85), sc, offset);
  ruv = distortUV(ruv, vec2(nUV.x+0.95,nUV.y+0.95), sc, offset);
  return ruv;
}

#define TAU 6.28318530718

void main() {
  vec2 size = vec2(textureSize(colorTexture, 0));

  // ── Debug: raw FBOs ───────────────────────────────────────────────────────
  if (debugMode == 1) { fragColor = texture(colorTexture, vUv); return; }
  if (debugMode == 2) { fragColor = texture(normalTexture, vUv); return; }

  // ── Paper grain (used in all branches below) ──────────────────────────────
  vec3 paperGrain = texture(paperTexture, vUv * size * 0.00025 * paperScale).rgb;

  // ── Ruled lines ───────────────────────────────────────────────────────────
  float lineFreq  = size.y / lineSpacing;
  float linePhase = fract(vUv.y * lineFreq);
  float lineMask  = 1.0 - smoothstep(0.0,  0.1, linePhase);
  lineMask       *= 1.0 - smoothstep(0.97, 1.0,   linePhase);
  float lineMask2 = 1.0 - smoothstep(0.0,  0.009, abs(linePhase - 0.015));

  // ── Margin line ───────────────────────────────────────────────────────────
  float marginDist = abs(vUv.x - marginPosition);
  float marginMask = 1.0 - smoothstep(0.0, 0.003, marginDist);

  // ── Assemble paper layer ──────────────────────────────────────────────────
  vec3 paperLayer = paperGrain;
  paperLayer = mix(paperLayer, lineColor,   lineMask  * lineOpacity);
  paperLayer = mix(paperLayer, lineColor,   lineMask2 * lineOpacity * 0.5);
  paperLayer = mix(paperLayer, marginColor, marginMask * marginOpacity);

  // ── Background: just show paper ───────────────────────────────────────────
  float objectAlpha = texture(colorTexture, vUv).a;
  if (objectAlpha < 0.01 && !hatchBackground) {
    fragColor = vec4(paperLayer, 1.);
    return;
  }

  // ── Hatching ──────────────────────────────────────────────────────────────
  const int levels = 10;
  float r = 1.;

  for (int i = 0; i < levels; i++) {
    float f     = float(i) / float(levels);
    vec2  uv    = warpUv(vUv, mix(.001, .5, f), mix(-10., 10., f));
    vec4  color = texture(colorTexture, uv);
    float l     = 1. - round(2. * luma(color.rgb) * float(levels)) / float(levels);

    if (l > float(i) / float(levels)) {
      float a        = angle + (TAU / 2.) * f;
      mat2  rot      = mat2(cos(a), -sin(a), sin(a), cos(a));
      vec2  noiseOff = noisiness * (texture(noiseTexture, .5 * uv).xy * 2. - 1.);
      vec2  pixUv    = rot * ((uv + noiseOff) * size * scale);
      r *= .5 + .5 * stripe(pixUv, mix(0.05, 0.2, f));
    }
  }

  r = smoothstep(.4, .6, r);

  if (debugMode == 3) { fragColor = vec4(vec3(r), 1.); return; }

  // ── Edges ─────────────────────────────────────────────────────────────────
  vec2  uv0  = warpUv(vUv, .1, 0.);
  float edg0 = sobel(normalTexture, uv0, size, edgeThickness).r;
  vec2  uv1  = warpUv(vUv, .2, 0.);
  float edg1 = sobel(normalTexture, uv1, size, edgeThickness).r;

  float edgeMask  = clamp((edg0 + edg1) * edgeStrength, 0., 1.);
  float hatchMask = r * (1. - aastep(0.3, edgeMask));

  if (debugMode == 4) { fragColor = vec4(vec3(1. - edgeMask), 1.); return; }

  // ── Final composite ───────────────────────────────────────────────────────
  // Ink colour tinted by paper grain — gives "drawn on paper" feel
  vec3 inkOnPaper  = mix(inkColor, inkColor * paperGrain * 1.5, paperOpacity);

  vec3 result = paperLayer;
  result = blendDarken(result, inkOnPaper, 1. - hatchMask);
  result = blendDarken(result, edgeColor,  edgeMask);

  fragColor = vec4(result, 1.);
}
`;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface PostParams {
  scale: number;
  angle: number;
  thickness: number;
  intensity: number;
  noisiness: number;
  inkColor: Color;
  hatchBackground: boolean;
  edgeColor: Color;
  edgeThickness: number;
  edgeStrength: number;
  paperScale: number;
  lineSpacing: number;
  lineColor: Color;
  lineOpacity: number;
  marginColor: Color;
  marginPosition: number;
  marginOpacity: number;
  paperOpacity: number;
  debugMode: number;
}

// ---------------------------------------------------------------------------
// Post
// ---------------------------------------------------------------------------
export class Post {
  private readonly renderer: WebGLRenderer;
  private readonly colorFBO: WebGLRenderTarget;
  private readonly normalFBO: WebGLRenderTarget;
  private readonly normalMat: MeshNormalMaterial;
  private readonly shader: RawShaderMaterial;
  private readonly quadScene: Scene;
  private readonly orthoCamera: OrthographicCamera;

  private readonly _savedClearColor = new Color();

  readonly params: PostParams;

  constructor(renderer: WebGLRenderer) {
    this.renderer = renderer;

    const fboOpts = {
      minFilter: LinearFilter,
      magFilter: LinearFilter,
      format:    RGBAFormat,
      type:      UnsignedByteType,
    };
    this.colorFBO  = new WebGLRenderTarget(1, 1, fboOpts);
    this.normalFBO = new WebGLRenderTarget(1, 1, fboOpts);

    this.normalMat = new MeshNormalMaterial({ side: DoubleSide });

    const noiseTexture = this.makeFallbackNoise();
    new TextureLoader().load(
      "./noise1.png",
      (tex) => {
        tex.wrapS = tex.wrapT = RepeatWrapping;
        this.shader.uniforms.noiseTexture.value = tex;
      },
      undefined,
      () => console.warn("Post: noise1.png not found, using procedural fallback.")
    );

    const paperFallback = new DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1);
    paperFallback.needsUpdate = true;

    this.params = {
      scale:           29.0,
      angle:           0.4,
      thickness:       0.28,
      intensity:       0.0007,
      noisiness:       0.003,
      inkColor:        new Color(0x1c71d8),
      hatchBackground: false,
      edgeColor:       new Color(0x000000),
      edgeThickness:   0.7,
      edgeStrength:    10.0,
      paperScale:      1.0,
      lineSpacing:     30.0,
      lineColor:       new Color(0x8ab4d4),
      lineOpacity:     0.35,
      marginColor:     new Color(0xd4606a),
      marginPosition:  0.07,
      marginOpacity:   0.5,
      paperOpacity:    0.85,
      debugMode:       0,
    };

    this.shader = new RawShaderMaterial({
      glslVersion: GLSL3,
      uniforms: {
        paperTexture:    { value: paperFallback },
        colorTexture:    { value: this.colorFBO.texture },
        normalTexture:   { value: this.normalFBO.texture },
        noiseTexture:    { value: noiseTexture },
        inkColor:        { value: this.params.inkColor },
        scale:           { value: this.params.scale },
        thickness:       { value: this.params.thickness },
        intensity:       { value: this.params.intensity },
        noisiness:       { value: this.params.noisiness },
        angle:           { value: this.params.angle },
        hatchBackground: { value: this.params.hatchBackground },
        edgeColor:       { value: this.params.edgeColor },
        edgeThickness:   { value: this.params.edgeThickness },
        edgeStrength:    { value: this.params.edgeStrength },
        paperScale:      { value: this.params.paperScale },
        lineSpacing:     { value: this.params.lineSpacing },
        lineColor:       { value: this.params.lineColor },
        lineOpacity:     { value: this.params.lineOpacity },
        marginColor:     { value: this.params.marginColor },
        marginPosition:  { value: this.params.marginPosition },
        marginOpacity:   { value: this.params.marginOpacity },
        paperOpacity:    { value: this.params.paperOpacity },
        debugMode:       { value: this.params.debugMode },
      },
      vertexShader:   orthoVs,
      fragmentShader,
    });

    const geo = new BufferGeometry();
    geo.setAttribute("position",
      new BufferAttribute(new Float32Array([-1,-1,0, 3,-1,0, -1,3,0]), 3));
    geo.setAttribute("uv",
      new BufferAttribute(new Float32Array([0,0, 2,0, 0,2]), 2));

    this.quadScene   = new Scene();
    this.quadScene.add(new Mesh(geo, this.shader));
    this.orthoCamera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  }

  // ---------------------------------------------------------------------------
  private makeFallbackNoise(): Texture {
    const size = 64;
    const data = new Uint8Array(size * size * 4);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 255;
    const tex = new DataTexture(data, size, size, RGBAFormat, UnsignedByteType);
    tex.wrapS = tex.wrapT = RepeatWrapping;
    tex.needsUpdate = true;
    return tex;
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------
  setSize(w: number, h: number): void {
    this.colorFBO.setSize(w, h);
    this.normalFBO.setSize(w, h);
  }

  setPaperTexture(texture: Texture): void {
    texture.wrapS = texture.wrapT = RepeatWrapping;
    this.shader.uniforms.paperTexture.value = texture;
  }

  setDebugMode(mode: 0 | 1 | 2 | 3 | 4): void {
    this.params.debugMode = mode;
    this.shader.uniforms.debugMode.value = mode;
  }

  render(scene: Scene, camera: Camera): void {
    const { renderer, colorFBO, normalFBO, normalMat, _savedClearColor } = this;

    renderer.getClearColor(_savedClearColor);
    const savedAlpha = renderer.getClearAlpha();

    renderer.setRenderTarget(colorFBO);
    renderer.setClearColor(0x000000, 0);
    renderer.clear();
    renderer.render(scene, camera);

    scene.overrideMaterial = normalMat;
    renderer.setRenderTarget(normalFBO);
    renderer.setClearColor(0x000000, 0);
    renderer.clear();
    renderer.render(scene, camera);
    scene.overrideMaterial = null;

    renderer.setRenderTarget(null);
    renderer.setClearColor(_savedClearColor, savedAlpha);
    renderer.render(this.quadScene, this.orthoCamera);
  }

  // ---------------------------------------------------------------------------
  // GUI
  // ---------------------------------------------------------------------------
  generateParams(gui: GUI): void {
    const u = this.shader.uniforms;

    gui.add(this.params, "debugMode", {
      "0 – Final":      0,
      "1 – Color FBO":  1,
      "2 – Normal FBO": 2,
      "3 – Hatch only": 3,
      "4 – Edges only": 4,
    }).name("Debug view").onChange((v: number) => { u.debugMode.value = v; });

    const hatchFolder = gui.addFolder("Hatching");
    hatchFolder.addColor(this.params, "inkColor").name("Ink colour")
      .onChange((v: Color) => { u.inkColor.value.copy(v); });
    hatchFolder.add(this.params, "hatchBackground").name("Hatch background")
      .onChange((v: boolean) => { u.hatchBackground.value = v; });
    hatchFolder.add(this.params, "scale",     0.1, 50,       0.01).name("Scale")
      .onChange((v: number) => { u.scale.value = v; });
    hatchFolder.add(this.params, "thickness", 0.05, 0.95,    0.01).name("Line thickness")
      .onChange((v: number) => { u.thickness.value = v; });
    hatchFolder.add(this.params, "angle",     0,    Math.PI, 0.01).name("Base angle")
      .onChange((v: number) => { u.angle.value = v; });
    hatchFolder.add(this.params, "noisiness", 0,    0.05,   0.001).name("Wobble")
      .onChange((v: number) => { u.noisiness.value = v; });
    hatchFolder.add(this.params, "intensity", 0,    0.005, 0.0001).name("Warp intensity")
      .onChange((v: number) => { u.intensity.value = v; });

    const edgeFolder = gui.addFolder("Edges");
    edgeFolder.addColor(this.params, "edgeColor").name("Edge colour")
      .onChange((v: Color) => { u.edgeColor.value.copy(v); });
    edgeFolder.add(this.params, "edgeThickness", 0.5, 10, 0.1).name("Edge width")
      .onChange((v: number) => { u.edgeThickness.value = v; });
    edgeFolder.add(this.params, "edgeStrength",  0,   10, 0.1).name("Edge strength")
      .onChange((v: number) => { u.edgeStrength.value = v; });

    const paperFolder = gui.addFolder("Paper");
    paperFolder.add(this.params, "paperScale",     0.1, 5,    0.1 ).name("Grain scale")
      .onChange((v: number) => { u.paperScale.value = v; });
    paperFolder.add(this.params, "lineSpacing",    10,  80,   1   ).name("Line spacing (px)")
      .onChange((v: number) => { u.lineSpacing.value = v; });
    paperFolder.addColor(this.params, "lineColor").name("Line colour")
      .onChange((v: Color) => { u.lineColor.value.copy(v); });
    paperFolder.add(this.params, "lineOpacity",    0,   1,    0.01).name("Line opacity")
      .onChange((v: number) => { u.lineOpacity.value = v; });
    paperFolder.addColor(this.params, "marginColor").name("Margin colour")
      .onChange((v: Color) => { u.marginColor.value.copy(v); });
    paperFolder.add(this.params, "marginPosition", 0,   0.5,  0.01).name("Margin position")
      .onChange((v: number) => { u.marginPosition.value = v; });
    paperFolder.add(this.params, "marginOpacity",  0,   1,    0.01).name("Margin opacity")
      .onChange((v: number) => { u.marginOpacity.value = v; });
    paperFolder.add(this.params, "paperOpacity",   0,   1,    0.01).name("Ink/paper mix")
      .onChange((v: number) => { u.paperOpacity.value = v; });
  }

  dispose(): void {
    this.colorFBO.dispose();
    this.normalFBO.dispose();
    this.shader.dispose();
    this.normalMat.dispose();
  }
}