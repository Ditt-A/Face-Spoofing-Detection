# Frontend development

The landing page lives in `frontend/` and runs independently of the research notebooks. Its simulation section calls the versioned API under `backend/` using internal example IDs. It does not upload user images or initialize checkpoints. Model loading in the API is disabled by default; see [the integration contract](api.md).

## Local setup

Use Node.js 22 LTS. From `frontend/`, run `npm ci` and `npm run dev`, then open http://localhost:3001. The application uses local fonts and local WebP files, so ordinary browsing does not contact an external font or image service.

`npm run build` type-checks TypeScript and emits a static production build to `dist/`. `npm run preview` serves that build on port 3001. Vite uses a relative base so the build can also live in a static-host subdirectory.

## Interactions and destinations

| Element | Behavior |
|---|---|
| Hero / navbar / footer anchors | Scroll to real page sections |
| Gallery filters | All six examples, one genuine example, or five attack examples |
| Gallery cards | Open a native modal dialog with details |
| Detail arrows | Cycle through the six examples, wrapping at either end |
| ArrowLeft / ArrowRight in detail | Previous / next example |
| Escape / close button / backdrop | Dismiss dialog and restore focus to its card |
| Use-case tabs | Explore registration, identity verification, or service access; ArrowUp/ArrowDown and Home/End supported |
| Method view toggle | Animate between the illustrative full image and face framing |
| FAQ accordion | Expand or collapse client-oriented explanations |
| Simulation | Select an internal example, call the API, view its result, reset or retry |
| Technical documentation / developer / feedback | Open the corresponding resource from the information footer |

The dialog uses the browser top layer and native focus trapping. The body is locked while it is open. Gallery controls keep labels visible on touch devices. Animations respect `prefers-reduced-motion`; the layout supports small phones through desktop screens.

## Motion

Hero elements enter in sequence. Gallery image hover, filter layout transitions, modal entrance/exit, image crossfades, use-case selection, contextual-image zoom, accordion height, and scroll reveals use short transitions. No perpetual animation or scroll hijacking is used. Motion React is configured with reducedMotion="user"; CSS motion has a reduced-motion override.

## Browser verification

Create the root `.venv` and install `backend/requirements-dev.txt`, then run `npx playwright install chromium` once and `npm run test:e2e` from `frontend/`. Playwright starts the frontend on port 4174 and a separate API on port 8311. Tests cover desktop Chrome and Pixel 7, including actual API responses, cancelled selections, request failures, and reconnection. Model loading is explicitly disabled for both testing and the default API configuration. Set `FSD_TEST_PYTHON` if the test Python executable is elsewhere.

## Notebook organization

Research notebooks are under `notebooks/`. Modelling resolves `PROJECT_ROOT` by searching the current directory and parents for the repository's `model/` and `notebooks/` directories, while retaining the existing standalone/Colab fallback. The cleaned dataset, pretrained weights, and checkpoint output paths stay rooted at the repository directory.

Stored cell outputs and execution counts have been removed, including large embedded preview images. Two malformed newline-string sections in Modelling were repaired. Python AST checks validate code-cell syntax without executing imports, downloads, preprocessing, training, or inference. Full runtime behavior still requires the data and hardware described in [the notebook guide](methodology.md).
