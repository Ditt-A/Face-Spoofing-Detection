# Website asset placement

These ten photographic assets were generated separately with built-in image_gen for this landing page. They are synthetic editorial material, not dataset samples, model predictions, or evaluation evidence. The original PNG files are retained in the user's Downloads asset package; the repository includes the optimized WebP deliverables.

| Asset | Placement and purpose |
|---|---|
| `01-hero-portrait` | Transparent main hero portrait, with a decorative framing overlay in CSS |
| `02-real-person` | Genuine-class card and detail viewer; identity reference for related assets |
| `03-printed-photo` | Small hero comparison and printed-photo gallery card / detail |
| `04-screen-replay` | Screen-presentation card / detail |
| `05-silicone-mask` | Mask card / detail |
| `06-mannequin` | Mannequin card / detail |
| `07-mixed-presentation` | Other-presentation card / detail; one mixed-media illustration |
| `08-dataset-archive` | Research / data-cleaning section |
| `09-dual-view-context` | Full-image and face-framing toggle in the methods section |
| `10-camera-cutout` | Transparent camera accent in the closing section |

The six gallery images are interactive cards with category filtering, a detail dialog, and previous/next navigation. The method illustration changes framing through CSS/Motion, not through an actual face detector. The hero frame is decorative. The fake_unknown class is not restricted to the mixed-media construction illustrated here.

Image paths are under `frontend/public/assets/images/`. The [manifest](manifest.json) records dimensions, file sizes, alpha, and placement. [Prompts](prompts.md) record the complete generation instructions. Assets 01 and 10 retain genuine transparency in WebP. The native SVG logo / favicon is code-authored under `frontend/public/brand/`.
