# Ballpoint Shader Notes

Repo: https://github.com/HillyDaan/HillyDaan.github.io

## What this project is

I built a Three.js app that transforms 3D models into a ballpoint pen drawing style.
The effect is created using hatch shading, Sobel edge detection, and a paper texture layer.

The app supports both built in geometry shapes and external GLB/GLTF model loading.

## Main files

- src/main.ts: application setup, camera, controls, GUI, and render loop
- src/Post.ts: post-processing shader pipeline for hatching, edges, and paper effects
- src/ModelLoader.ts: GLB/GLTF model loading logic
- src/presets.ts: built in geometry preset definitions
- __tests__/site.test.js: positive and negative integrity tests
- .github/workflows/ci.yml: GitHub Actions CI workflow

## How I tested it

I separated my tests into two groups: positive tests and negative tests.

Positive tests verify that required features are still present:
- required project files
- shader features such as debug modes and Sobel edge detection
- built-in geometry presets
- GLTF model loading functionality
- CI deployment and health check commands

Negative tests verify that invalid changes are detected:
- missing or incorrect file paths
- unsupported debug modes
- unexpected geometry presets
- invalid loader references
- incorrect localhost ports in the CI workflow

I chose this testing approach because it is lightweight and works well in CI. It does not require launching the full application, but it can still catch common mistakes before changes are merged.

## CI.yml

The GitHub Actions workflow runs on pushes and pull requests to the main branch.

It installs dependencies, runs linting and tests, builds the project, and performs a local health check on port 3000 for push events.


Workflow Steps
1. Checkout Repository

The first step downloads the project code from the repository:

actions/checkout@v4

This allows the workflow to access all project files for the following steps.

2. Setup Node.js Environment

The project uses Node.js, so the workflow installs Node.js version 20:

actions/setup-node@v4

It also enables npm caching to make future workflow runs faster.

3. Install Dependencies

Command:

npm ci

npm ci installs the exact dependencies listed in package-lock.json.

I used this instead of npm install because it creates a more consistent environment in CI and avoids unexpected dependency changes.

4. Clean Project Files

Command:

npm run clean

This runs the project's clean script before testing and building.

The purpose is to remove unwanted files or folders that could affect the build process.

5. Static Analysis

Command:

npx eslint . --ext .js

ESLint checks JavaScript files for possible code issues, formatting problems, and common mistakes.

This helps maintain code quality before the application is built.

6. Run Unit Tests

Command:

npm test

The workflow runs the Jest test suite.

The tests check:

Required project files exist
Shader features are present
Geometry presets are available
GLTF model loading functionality exists
CI workflow contains required deployment commands

The tests also verify that invalid changes are detected, such as:

Missing files
Unsupported debug modes
Unexpected geometry presets
Invalid loader references
Incorrect localhost ports
7. Build Application

Command:

npm run build

This creates the production build of the Three.js application.

A successful build confirms that the project can compile correctly and generate deployable files.

8. Local Deployment Health Check

This step only runs when changes are pushed directly to the main branch:

if: github.event_name == 'push' && github.ref == 'refs/heads/main'

The workflow performs a local deployment test.

First, it removes any previous deployment folder:

rm -rf local-deploy

Then it creates a new deployment directory:

mkdir -p local-deploy

The production build files are copied into the deployment folder:

cp -r dist/. local-deploy/

After that, a local web server is started:

python3 -m http.server 3000 --directory local-deploy

Finally, the workflow checks that the website responds correctly:

curl --fail --retry 10 --retry-delay 1 --retry-connrefused http://localhost:3000/

The health check confirms that the built application can be served successfully.

## Commands I use

```bash
npm run dev
npm run build
npm test
```

## How to trigger build pipeline
1. Push to master
2. update a pull request whose target branch is master

```bash
git add .
git commit -m "trigger ci"
git push origin master
```