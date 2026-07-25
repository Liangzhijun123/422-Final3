<<<<<<< HEAD
GitHub Open Source: https://github.com/HillyDaan/HillyDaan.github.io

Project: Ballpoint Shader

This project is a Three.js application that renders 3D models with a ballpoint pen drawing style instead of realistic lighting. 
It uses custom shaders for hatching, edge lines, and paper texture. Users can pick built in models or upload GLB/GLTF models.

Main files

- src/main.ts: scene setup, camera, controls, and model upload flow.
- src/Post.ts: post-processing shader and render pipeline.
- src/ModelLoader.ts: GLB/GLTF loading logic.
- src/presets.ts: built-in geometry presets.


ci.yml

1) name: Ballpoint shader
- Gives the workflow a display name in GitHub Actions.

2) on:
- Starts trigger rules.

3) push:
6) branches: [main]
- Run workflow when a PR targets main.

7) jobs:
- Starts list of jobs.
8) build-test-deploy:
- Job id/name key.
9) runs-on: ubuntu-latest
- Use latest Ubuntu runner machine.

- Start sequential steps in this job.

11) uses: actions/checkout@v4

12) - name: Setup Node.js
14) with:
15) node-version: 20
- Install Node 20 and enable npm dependency cache.

18) run: npm ci
- Install exact versions from package-lock.json.
19) - name: 1. Clean forbidden folders
20) run: npm run clean

21) - name: 2. Static Analysis
22) run: npx eslint . --ext .js
- Lint JavaScript files in project.

23) - name: 3. Unit Tests
- Run test suite.

25) - name: 4. Build
- Build production files, usually into dist.

27) - name: 6. Start local server and run health check
- Only execute this step for direct pushes to main.

29) run: |

30) rm -rf local-deploy
- Remove old local deploy folder if it exists.
31) mkdir -p local-deploy
- Create new local deploy folder.

- Copy built files from dist into local deploy.

33) python3 -m http.server 3000 --directory local-deploy > /tmp/local-server.log 2>&1 &

34) SERVER_PID=$!

35) trap "kill $SERVER_PID" EXIT

36) curl --fail --retry 10 --retry-delay 1 --retry-connrefused http://localhost:3000/



1) const fs = require('fs');

2) function read(filePath) {
4) }
- Helper function to read text file contents.
5) describe('Project Structure', () => {
- Start test group about required files.
6) test('includes required app entry files', () => {
- Test case: required files should exist.

7) const requiredFiles = [ ... ];
- List of files expected in project.
8) for (const file of requiredFiles) {
9) expect(fs.existsSync(file)).toBe(true);
10) }
- Loop through each file and assert it exists.
11) });
12) });

13) describe('Ballpoint Shader Features', () => {

14) test('Post shader keeps debug modes and edge detection logic', () => {

15) const postSource = read('src/Post.ts');
- Read shader source file as text.

17) expect(postSource).toContain('if (debugMode == 4)');
18) expect(postSource).toContain('sobel(normalTexture');
19) expect(postSource).toContain('const int levels = 10');

20) });

21) test('presets include expected built-in geometry options', () => {

22) const presetSource = read('src/presets.ts');

23) const expectedPresets = ['sphere', 'box', 'torus', 'torusKnot', 'cone', 'cylinder'];
- Expected shape names.

24) for (const name of expectedPresets) {
26) }
- For each expected preset, check it appears as an object key.
27) });
- End preset test.
28) test('model loader supports GLTF loading API', () => {
- Verify ModelLoader keeps core GLTF-related API pieces.
29) const loaderSource = read('src/ModelLoader.ts');
- Read model loader file.
30) expect(loaderSource).toContain('class ModelLoader');
31) expect(loaderSource).toContain('loadFromUrl');
32) expect(loaderSource).toContain('GLTFLoader');
- Check class name, method, and dependency are present.
33) });
34) });

35) describe('CI Local Deployment Contract', () => {

36) test('workflow deploys locally and health-checks localhost:3000', () => {

37) const workflow = read('.github/workflows/ci.yml');
- Read workflow file text.

39) expect(workflow).toContain('cp -r dist/. local-deploy/');
40) expect(workflow).toContain('python3 -m http.server 3000 --directory local-deploy');
41) expect(workflow).toContain('curl --fail');
- Assert important CI commands exist in workflow.

44) });
- End final test and group.
Run tests

=======
# Ballpoint Shader Notes

Repo: https://github.com/HillyDaan/HillyDaan.github.io



I built a Three.js app that makes 3D models look like they were drawn with a ballpoint pen.
The effect is made from hatch shading, edge detection, and a paper layer.
I can use built-in shapes or load GLB/GLTF models.

## Main files

- src/main.ts: app setup, camera, controls, and render loop
- src/Post.ts: shader and post-processing pipeline
- src/ModelLoader.ts: model loading logic
- src/presets.ts: built-in geometry options
- __tests__/site.test.js: project tests
- .github/workflows/ci.yml: CI pipeline

## How I tested it

I separated tests into two groups: positive and negative.

Positive tests check that important parts exist:
- required files
- shader features
- geometry presets
- model loader pieces
- CI deployment and health check commands

Negative tests check things that should not exist:
- fake file paths
- invalid debug mode branch
- unsupported preset names
- fake loader symbols
- wrong localhost port in CI

I used this setup because it is simple and works well in CI without running the full app UI.
It still catches common mistakes before merge.

## CI in simple terms

The workflow runs on push and pull request to main.
It installs dependencies, runs lint and tests, builds the project, then does a local health check on port 3000 for push events.

## Commands I use

- npm run dev
- npm run build
- npm test -- --runInBand

## Project Description

Ballpoint Shader is a Three.js project where I turned normal 3D rendering into a pen-drawing style.
I used a custom post-process shader with hatching, Sobel edges, and paper compositing.
I also added positive and negative tests so missing files, bad config changes, and unsupported code paths get caught early.
>>>>>>> 2dbdeec (Project snapshot before remote rebase)
