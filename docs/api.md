# Simulation API and model integration

The UI accepts only the six internal example IDs. It displays a clear model-not-loaded notice and reference-result preview when the service uses fallback. There is no upload control, file-upload route, user-selectable scenario parameter, or remote image URL parameter.

The internal images are dataset excerpts recovered from the original notebook's saved visualizations. [Provenance](assets/dataset/README.md) records their source filenames, original notebook commit, crop rectangles, and resolution limitations. Fallback labels preserve the notebook's class labels, including examples from an anomaly audit; they are not independently verified ground truth.

## API contract

`GET /api/v1/examples` returns `{"examples": [...]}`. Every item contains `id`, `title`, `image_name`, `width`, `height`, `summary`, and `observations`. `image_name` points to a local WebP served by the frontend.

`POST /api/v1/analyze` consumes JSON:

```json
{"example_id": "fake_printed"}
```

Allowed IDs are `realperson`, `fake_printed`, `fake_screen`, `fake_mask`, `fake_mannequin`, and `fake_unknown`. Extra fields are rejected. Unknown IDs return 422. A missing internal image returns 503 with a readable message.

The response includes a unique `request_id`, UTC `created_at`, `verdict` (`genuine`, `spoof`, or `review`), `label`, `class_name`, `title`, `summary`, `observations`, optional `confidence`, image metadata, measured `elapsed_ms`, and provider metadata. Text describing a predicted class is a class interpretation, not a model-generated explanation of localized image evidence.

Default response provenance is explicit:

```json
{
  "metadata": {
    "provider": "fallback",
    "model_loaded": false,
    "fallback_reason": "model_disabled",
    "result_source": "reference_example"
  },
  "confidence": null
}
```

Fallback labels come from the selected example's known reference. They are deterministic fixtures, not inference or an estimate from image content. No confidence scores, probabilities, or face bounding boxes are fabricated. Each analysis still makes a real HTTP request to the backend.

## Model lifecycle

`GET /api/v1/health` reports `provider`, `model_loaded`, `model_load_enabled`, and `model_state`. States are `disabled`, `not_configured`, `load_failed`, and `ready`.

- Default: `FSD_ENABLE_MODEL=0`; the configured factory is not imported or invoked.
- Explicitly enabled without a factory: use reference fallback with `model_not_configured`.
- Initialization failure: use reference fallback with `model_load_failed`.
- Prediction failure: use reference fallback with `prediction_failed` for that request.
- Successful real prediction: return `provider=model`, `result_source=model_prediction`, and no fallback reason.

There is intentionally no public endpoint that loads a model. Model initialization occurs once during service startup only after the loading flag is explicitly enabled. A predictor's optional `close()` method is called at shutdown. The current checkout does not include an implementation that loads the research models into this API.

## Connecting the real predictor later

Implement a factory in your model package, for example `your_model.adapter:create_predictor`. It takes no arguments and returns an object with a synchronous method:

```python
def predict(self, *, image_bytes: bytes) -> dict:
    # Decode WebP, apply your training-consistent preprocessing,
    # and run your loaded predictor here.
    return {"label": predicted_class_name, "confidence": optional_confidence}
```

`label` must be one of the six class strings, or `None` to request review. `confidence` is optional / nullable and must lie between 0 and 1. The API validates it using `ModelPrediction`. Keep the training class order when converting an argmax index: `fake_mannequin`, `fake_mask`, `fake_printed`, `fake_screen`, `fake_unknown`, `realperson`.

The factory is where checkpoint paths, device selection, preprocessing configuration, and the actual loading code belong. Preserve the existing training preprocessing when wiring the models; this API does not substitute a different classifier. Checkpoints and any external pretrained assets remain a separate requirement described in [the research guide](methodology.md).

Only when that adapter and its environment are ready, set both `FSD_MODEL_FACTORY=your_model.adapter:create_predictor` and `FSD_ENABLE_MODEL=1`, then restart the service. The frontend already consumes the same response schema; it hides the model-not-loaded notice when real inference is available and shows a confidence value only when the provider supplies one.

## Browser behavior

The section is reachable at `/#simulasi`. Choosing another example or resetting aborts an in-flight request and clears its result. Responses from a cancelled selection cannot overwrite the current image. A failed analysis can be retried. An unavailable service can be reconnected without reloading the page. UI request timeouts restore controls.

The frontend does not send images; it sends an ID. The backend resolves only its own fixed image names inside `FSD_ASSET_DIR`. It does not persist request images or keep a user image history.

The API follows FastAPI's [lifespan](https://fastapi.tiangolo.com/advanced/events/) pattern for the explicitly gated provider lifecycle.
