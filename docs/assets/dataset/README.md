# Dataset-derived gallery and simulation images

Six samples recovered directly from embedded PNG visualizations in [the original notebook](https://github.com/Ditt-A/Face-Spoofing-Detection/blob/713802894934b6b4266466944634ff5a83af0bd7/Data_Cleaning.ipynb). No notebook cells or ML models were executed.

| Class | Filename shown in source | Extracted resolution | Cell / output (zero based) |
|---|---|---|---|
| realperson | real_194.jpg | 225 × 299 | 33 / 6 |
| fake_printed | printed_088.jpg | 220 × 288 | 35 / 3 |
| fake_screen | screen_219.jpg | 168 × 299 | 33 / 4 |
| fake_mask | mask_042.jpg | 141 × 296 | 35 / 2 |
| fake_mannequin | mannequin_147.jpg | 282 × 212 | 35 / 1 |
| fake_unknown | unknown_338.jpeg | 162 × 162 | 16 / 0 |

The PNG files here preserve the recovered pixels. The frontend uses lossless WebP versions under frontend/public/assets/images/dataset-*.webp. Pixel equality between the PNG and WebP was checked. The manifest records the original notebook commit/blob, source-plot hashes, crop rectangles, source filenames, and output hashes.

These are excerpts of notebook plots, not recovered original JPEG files. Their resolution is limited by the saved visualization, and they have not been enlarged or restored with AI. The source labels are retained from the notebook; samples shown in a centroid-anomaly audit must not be treated as independently verified ground truth. The default simulation continues to show reference previews with a model-not-loaded notice.

Editorial hero and supporting imagery remain separate generated assets.
