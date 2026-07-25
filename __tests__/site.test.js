const fs = require('fs');

function read(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

describe('Positive Tests', () => {
  test('includes required app entry files', () => {
    const requiredFiles = [
      'index.html',
      'src/main.ts',
      'src/Post.ts',
      'src/ModelLoader.ts',
      'src/presets.ts',
      'ci.yml',
      '.github/workflows/ci.yml',
    ];

    for (const file of requiredFiles) {
      expect(fs.existsSync(file)).toBe(true);
    }
  });

  test('Post shader keeps debug modes and edge detection logic', () => {
    const postSource = read('src/Post.ts');

    expect(postSource).toContain('debugMode');
    expect(postSource).toContain('if (debugMode == 4)');
    expect(postSource).toContain('sobel(normalTexture');
    expect(postSource).toContain('const int levels = 10');
  });

  test('presets include expected built-in geometry options', () => {
    const presetSource = read('src/presets.ts');

    const expectedPresets = ['sphere', 'box', 'torus', 'torusKnot', 'cone', 'cylinder'];

    for (const name of expectedPresets) {
      expect(presetSource).toContain(`${name}:`);
    }
  });

  test('model loader supports GLTF loading API', () => {
    const loaderSource = read('src/ModelLoader.ts');

    expect(loaderSource).toContain('class ModelLoader');
    expect(loaderSource).toContain('loadFromUrl');
    expect(loaderSource).toContain('GLTFLoader');
  });

  test('workflow deploys locally and health-checks localhost:3000', () => {
    const workflow = read('.github/workflows/ci.yml');

    expect(workflow).toContain('npm run clean');
    expect(workflow).toContain('cp -r dist/. local-deploy/');
    expect(workflow).toContain('python3 -m http.server 3000 --directory local-deploy');
    expect(workflow).toContain('curl --fail');
    expect(workflow).toContain('http://localhost:3000/');
  });
});

describe('Negative Tests', () => {
  test('missing files are detected', () => {
    const missingFiles = ['src/DoesNotExist.ts', '.github/workflow/ci.yml'];

    for (const file of missingFiles) {
      expect(fs.existsSync(file)).toBe(false);
    }
  });

  test('Post shader does not include invalid debug mode branch', () => {
    const postSource = read('src/Post.ts');

    expect(postSource).not.toContain('if (debugMode == 99)');
  });

  test('presets do not include unexpected geometry options', () => {
    const presetSource = read('src/presets.ts');
    const unexpectedPresets = ['pyramid', 'capsule', 'icosahedron'];

    for (const name of unexpectedPresets) {
      expect(presetSource).not.toContain(`${name}:`);
    }
  });

  test('model loader does not reference unsupported loader symbol', () => {
    const loaderSource = read('src/ModelLoader.ts');

    expect(loaderSource).not.toContain('NonExistentLoaderXYZ');
  });

  test('workflow does not target the wrong localhost port', () => {
    const workflow = read('.github/workflows/ci.yml');

    expect(workflow).not.toContain('http://localhost:8080/');
  });
});