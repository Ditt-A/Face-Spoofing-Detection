# Website asset placement

The live gallery and simulation use six dataset-derived samples under `frontend/public/assets/images/dataset-*.webp`. They were recovered from saved notebook visualizations; see [sample provenance and limitations](dataset/README.md) and the [manifest](dataset/manifest.json). The PNG excerpts preserve the available notebook pixels and are encoded losslessly as WebP. The original dataset JPEG files were not found in the checkout.

The editorial asset set below was generated separately with built-in image_gen. Hero and supporting visuals still use it; the generated class-gallery prototypes are retained as design-source assets. They are not presented as dataset samples or model predictions.

| Asset | Placement and purpose |
|---|---|
| `01-hero-portrait` | Transparent main hero portrait, with a decorative framing overlay in CSS |
| `02-real-person` | Archived gallery prototype; identity reference for related editorial assets |
| `03-printed-photo` | Small editorial hero comparison; no longer used by the gallery |
| `04-screen-replay` | Archived screen-presentation gallery prototype |
| `05-silicone-mask` | Archived mask gallery prototype |
| `06-mannequin` | Archived mannequin gallery prototype |
| `07-mixed-presentation` | Archived mixed-media gallery prototype |
| `08-dataset-archive` | Verification-benefits section, illustrating different faces and presentation media |
| `09-dual-view-context` | Full-image and face-framing toggle in the methods section |
| `10-camera-cutout` | Transparent camera accent in the closing section |

The six dataset gallery images are interactive cards with category filtering, a detail dialog, and previous/next navigation. Their full framing is preserved with `object-fit: contain`; they are not recreated or restored using AI. The `fake_unknown` sample now shows the painting present in the notebook, and its text describes that representation. The generated method illustration changes framing through CSS/Motion, not through an actual face detector. The hero frame is decorative.

Image paths are under `frontend/public/assets/images/`. The [editorial manifest](manifest.json) records the original generated set; its prompt history remains in [prompts](prompts.md). The separate [dataset manifest](dataset/manifest.json) records source notebook commit, filenames, plot hashes, crop coordinates, resolutions, and output hashes. Editorial assets 01 and 10 retain genuine transparency. The native SVG logo / favicon is code-authored under `frontend/public/brand/`.
