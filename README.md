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
- __tests__/site.test.js: grouped tests for project files, shader, presets, loader, and CI
- .github/workflows/ci.yml: GitHub Actions CI workflow

## How I tested it

The test file `__tests__/site.test.js` is organized by feature, so it is easy to read:

1. Project files
- checks required files exist
- checks missing files are detected

2. Post shader
- checks debug mode and Sobel edge logic are present
- checks invalid debug mode logic is not present

3. Geometry presets
- checks supported preset names are present
- checks unsupported preset names are not present

4. Model loader
- checks the model loader class and API symbols are present
- checks unsupported loader symbols are not present

5. CI workflow
- checks local deploy and localhost health-check commands are present
- checks wrong localhost ports are not used

This approach is lightweight and works well in CI because it validates important project structure and configuration without launching the full app.

## CI.yml

The GitHub Actions workflow runs on pushes and pull requests to the master branch.

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

Required project files and missing-file detection
Post shader debug settings and Sobel edge-detection logic
Geometry presets for allowed and unsupported options
Model loader class/API symbols and unsupported loader references
CI local deploy and localhost health-check commands

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

This step is currently configured to run only when changes are pushed to the main branch:

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
2. Open or update a pull request whose target branch is master

```bash
git add .
git commit -m "trigger ci"
git push origin master
```
