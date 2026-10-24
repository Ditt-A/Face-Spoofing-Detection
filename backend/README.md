# Face Spoofing Detection API

A small FastAPI service for the website's internal-example simulation. By default it runs a reference fallback, never imports an ML runtime, and never reads model checkpoints. It does not accept image uploads or remote image URLs.

## Start locally

Use Python 3.11 or later. From the repository root on PowerShell:

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r backend/requirements.txt
$env:FSD_ENABLE_MODEL = '0'
.\.venv\Scripts\python.exe -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8301
```

On macOS/Linux, use `.venv/bin/python` and `FSD_ENABLE_MODEL=0 .venv/bin/python -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8301`.

The API docs are at http://127.0.0.1:8301/docs, and health is at http://127.0.0.1:8301/api/v1/health. Start the frontend separately with `npm run dev` from `frontend/`, then open http://localhost:3001/#simulasi.

## Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/v1/health` | Provider, model state, and explicit loading flag |
| GET | `/api/v1/examples` | Six whitelisted internal example images |
| POST | `/api/v1/analyze` | Analyze a selected internal example ID |
| GET | `/docs` | Interactive OpenAPI documentation |

Full request, response, fallback, and predictor contracts are in [the API integration guide](../docs/api.md).

## Configuration

| Variable | Default | Purpose |
|---|---|---|
| `FSD_ENABLE_MODEL` | `0` | Model loading is disabled unless explicitly set to `1` |
| `FSD_MODEL_FACTORY` | empty | Optional `module:function` that constructs a real predictor |
| `FSD_ASSET_DIR` | `frontend/public/assets/images` in this checkout | Directory containing the six internal WebP examples |
| `FSD_ALLOWED_ORIGINS` | localhost and 127.0.0.1 on port 3001 | Comma-separated browser origins for direct API requests |

The frontend's Vite proxy reads `FSD_API_URL`, defaulting to `http://127.0.0.1:8301`. Its `server` and `preview` configurations both proxy `/api` to the service. A production static host must provide the same `/api` reverse proxy, or host the API behind the frontend origin.

## Tests

From the repository root:

```powershell
.\.venv\Scripts\python.exe -m pip install -r backend/requirements-dev.txt
.\.venv\Scripts\python.exe -m pytest backend/tests -q
```

Tests verify the no-load default, all six reference responses, invalid-input rejection, missing assets, explicit adapter loading using tiny test doubles, fallback on errors, and the stable response contract. No ML checkpoint is loaded by these tests.
