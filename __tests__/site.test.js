const fs = require('fs');

function read(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

describe('Project files', () => {
  test('includes the required application files', () => {
    const requiredFiles = [
      'index.html',
      'src/main.ts',
      'src/Post.ts',
      'src/ModelLoader.ts',
      'src/presets.ts',
      '.github/workflows/ci.yml',
    ];

    for (const file of requiredFiles) {
      expect(fs.existsSync(file)).toBe(true);
    }
  });

  test('detects missing files', () => {
    const missingFiles = ['src/DoesNotExist.ts', '.github/workflow/ci.yml'];

    for (const file of missingFiles) {
      expect(fs.existsSync(file)).toBe(false);
    }
  });
});

describe('Post shader', () => {
  test('includes the expected debug and edge-detection settings', () => {
    const postSource = read('src/Post.ts');

    expect(postSource).toContain('debugMode');
    expect(postSource).toContain('if (debugMode == 4)');
    expect(postSource).toContain('sobel(normalTexture');
    expect(postSource).toContain('const int levels = 10');
  });

  test('does not include an invalid debug mode', () => {
    const postSource = read('src/Post.ts');

    expect(postSource).not.toContain('if (debugMode == 99)');
  });
});

describe('Geometry presets', () => {
  test('includes the supported geometry options', () => {
    const presetSource = read('src/presets.ts');

    const expectedPresets = ['sphere', 'box', 'torus', 'torusKnot', 'cone', 'cylinder'];

    for (const name of expectedPresets) {
      expect(presetSource).toContain(`${name}:`);
    }
  });

  test('does not include unsupported geometry options', () => {
    const presetSource = read('src/presets.ts');
    const unexpectedPresets = ['pyramid', 'capsule', 'icosahedron'];

    for (const name of unexpectedPresets) {
      expect(presetSource).not.toContain(`${name}:`);
    }
  });
});

describe('Model loader', () => {
  test('includes the model-loading class and API', () => {
    const loaderSource = read('src/ModelLoader.ts');

    expect(loaderSource).toContain('class ModelLoader');
    expect(loaderSource).toContain('loadFromUrl');
    expect(loaderSource).toContain('GLTFLoader');
  });

  test('does not reference unsupported loader symbols', () => {
    const loaderSource = read('src/ModelLoader.ts');

    expect(loaderSource).not.toContain('NonExistentLoaderXYZ');
  });
});

describe('CI workflow', () => {
  test('includes local deployment and localhost health-check commands', () => {
    const workflow = read('.github/workflows/ci.yml');

    expect(workflow).toContain('npm run clean');
    expect(workflow).toContain('cp -r dist/. local-deploy/');
    expect(workflow).toContain('python3 -m http.server 3000 --directory local-deploy');
    expect(workflow).toContain('curl --fail');
    expect(workflow).toContain('http://localhost:3000/');
  });

  test('does not use the wrong localhost port', () => {
    const workflow = read('.github/workflows/ci.yml');

    expect(workflow).not.toContain('http://localhost:8080/');
  });
});
