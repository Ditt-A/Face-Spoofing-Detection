# Face Spoofing Detection

Face Spoofing Detection is a notebook-based deep learning project for classifying real and spoofed face images. The project trains and ensembles multiple vision models to detect common face presentation attacks across six classes:

| Label | Type | Meaning |
|---|---|---|
| `realperson` | Genuine | Real human face image |
| `fake_printed` | Spoof | Face attack using a printed photo |
| `fake_screen` | Spoof | Face attack displayed on a screen |
| `fake_mask` | Spoof | Face attack using a face mask |
| `fake_mannequin` | Spoof | Face-like mannequin or artificial head |
| `fake_unknown` | Spoof | Other or mixed spoofing patterns |

The repository contains two main notebooks:

- `Data_Cleaning.ipynb` cleans the raw image dataset with DINOv3 embeddings, duplicate detection, class-centroid anomaly checks, and visual audits.
- `Modelling.ipynb` runs the modelling pipeline: environment setup, face preprocessing, model training, test-time augmentation, ensemble prediction, and optional meta-layer post-processing.

## Repository Structure

```text
Face-Spoofing-Detection
|-- Data_Cleaning.ipynb
|-- Modelling.ipynb
|-- model/
|   |-- dinov3_cnx.pt
|   |-- fsfm.pt
|   |-- probs_dinov3_cnx.npy
|   |-- probs_dinov3_vith.npy
|   `-- probs_fsfm.npy
|-- .gitattributes
|-- .gitignore
`-- dataset_rotated.zip          # local dataset archive, ignored by git
```

`dataset_rotated.zip` is intentionally ignored because it is large. Place it in the repository root before running the modelling notebook, or update the dataset path in the notebook.

The `.pt` model files are tracked with Git LFS. After cloning the repo, run:

```bash
git lfs install
git lfs pull
```

## Data

The modelling notebook expects a cleaned dataset archive named `dataset_rotated.zip`. When extracted, it should contain the class folders directly:

```text
dataset_rotated/
|-- fake_mannequin/
|-- fake_mask/
|-- fake_printed/
|-- fake_screen/
|-- fake_unknown/
`-- realperson/
```

For inference, the notebook also expects test images. By default it looks for:

- Colab: a Google Drive test image folder configured in `TEST_DIR`
- Local fallback: `test_images/` in the repository root

If your files are somewhere else, edit `TEST_DIR` in the configuration cell of `Modelling.ipynb`.

## Methodology

The project uses a hybrid pipeline: clean the dataset first, generate two image views, train several complementary models, then fuse their probabilities.

### 1. Data Cleaning and Quality Audit

Before training, the dataset is checked and cleaned to reduce duplicate or visually confusing samples.

- The raw training images are scanned by class and visually sampled.
- DINOv3 embeddings are extracted for every training image.
- Cosine similarity is used to find duplicate or near-duplicate groups.
- A duplicate threshold of `0.97` is used.
- When duplicates are found, the image that best matches its class centroid is kept.
- Class-centroid similarity is also used to flag possible anomaly candidates for manual review.

In the project experiment, this process reduced the training set from `1,652` images to `1,427` images. It found `199` duplicate groups, removed `225` duplicate images, and marked `542` anomaly candidates for review. The anomaly candidates are not deleted automatically.

### 2. Dual-View Preprocessing

Each image is converted into two views:

- `full image`: keeps the global context, such as background, printed-paper edges, screen borders, or mannequin shape.
- `face crop`: focuses on local face details, such as skin texture, mask surface, print artifacts, or screen patterns.

The face crop is generated with a YOLO-based face detector. The detected face bounding box is expanded by `20%` on each side so nearby spoofing artifacts are not removed. If no face is detected, the pipeline falls back to an `80%` center crop.

Each model uses its own input resolution:

| Model | Input Resolution | Input View |
|---|---:|---|
| DINOv3 ViT-H+ | `448 x 448` | Full image + face crop |
| DINOv3 ConvNeXt-Large | `384 x 384` | Full image + face crop |
| FSFM ViT-B/16 | `224 x 224` | Full image + face crop |

The preprocessed full image and face crop are cached so face detection does not need to run repeatedly during training and inference.

### 3. Deep Learning Branches

The modelling notebook trains three main deep learning branches:

| Branch | Main Role | Input / Fine-Tuning |
|---|---|---|
| `DINOv3 ViT-H+` | Strong general visual foundation model | RGB input with LoRA fine-tuning |
| `DINOv3 ConvNeXt-Large` | Captures spatial and frequency artifacts | RGB + FFT six-channel input, direct fine-tuning |
| `FSFM ViT-B/16` | Face-specific representation branch | RGB input with LoRA fine-tuning |

For each deep model, the full image and face crop are passed through the same backbone separately. Their features are concatenated before the classification head. This is feature-level fusion, not a simple average of full-image and crop predictions.

The model predicts:

- a six-class spoofing label
- an auxiliary binary real/spoof output

DINOv3 ViT-H+ and FSFM use LoRA for parameter-efficient fine-tuning. The LoRA configuration uses rank `8`, alpha `16`, and dropout `0.05`. DINOv3 ConvNeXt-Large is fine-tuned directly because its input stem is adapted for six-channel RGB+FFT input.

### 4. Artifact-Aware Machine Learning Branch

The methodology also defines an optional `Rotated-ML` branch for non-semantic spoofing artifacts. This branch extracts tabular features from each image:

| Feature Group | Examples |
|---|---|
| File-level | File size, extension, image dimensions, aspect ratio, pixel count |
| EXIF metadata | Camera/software fields when available |
| Color and intensity | RGB, HSV, and grayscale statistics |
| Texture | LBP, Gabor filters, GLCM |
| Frequency | FFT and DCT features |
| Visual embeddings | Pretrained EfficientNet-B0 and ViT-Tiny embeddings |

LightGBM and CatBoost are trained with out-of-fold validation. Their probabilities are combined using a searched weight based on macro F1. The resulting probabilities can be used as an additional signal in the final meta-layer.

### 5. Inference, TTA, and Probability Fusion

During inference, each deep model uses test-time augmentation with three views:

- standard resize
- horizontal flip
- larger resize followed by center crop

The probabilities from the TTA views are averaged per model. The baseline ensemble then averages probabilities from the three deep models: DINOv3 ViT-H+, DINOv3 ConvNeXt-Large, and FSFM.

An optional rule-based meta-layer can refine ambiguous predictions using confidence thresholds. In this workflow, DINOv3 ViT-H+ is used as the base decision, while ConvNeXt and Rotated-ML probabilities provide extra correction signals for difficult cases.

## Environment

Running the full pipeline is GPU-heavy. Google Colab with an NVIDIA L4/A100/T4 GPU or Kaggle GPU is recommended. CPU-only execution is not practical for full training.

The modelling notebook installs or checks these core dependencies:

```bash
pip install numpy==2.4.4 torch==2.11.0 torchvision==0.26.0 timm==1.0.20 transformers==4.56.0 scikit-learn==1.8.0
pip install ultralytics==8.4.33 torchmetrics==1.9.0 albumentations==2.0.8 opencv-python pillow pandas matplotlib tqdm kagglehub huggingface_hub
```

The notebook also downloads or expects these external assets:

- FSFM source repo, cloned at runtime into `/tmp/fsfm`
- DINOv3 source repo, cloned at runtime into `/tmp/dinov3`
- YOLO face detector weight `yolov11n-face.pt`, downloaded automatically if missing
- FSFM pretrained checkpoint and normalization stats, downloaded automatically if missing
- DINOv3 pretrained weights:
  - `dinov3_vith16plus_pretrain_lvd1689m-7c1da9a5.pth`
  - `dinov3_convnext_large_pretrain_lvd1689m-61fa432d.pth`

The DINOv3 pretrained weights must be placed in the expected path or the notebook configuration must be edited to point to them.

## How to Run `Modelling.ipynb`

### Option 1: Google Colab

1. Upload or mount this repository in Colab.
2. Put `dataset_rotated.zip` in the notebook working directory or in a Google Drive folder.
3. Put test images in a folder such as `/content/drive/MyDrive/face_spoofing/test_images`.
4. Put DINOv3 pretrained weights in a Drive folder or the notebook working directory.
5. Open `Modelling.ipynb`.
6. Update the configuration cell so `DATASET_ZIP`, `TEST_DIR`, `CKPT_DIR`, and weight paths match your folders.
7. Run the notebook from top to bottom:
   - install dependency cells
   - mount Google Drive
   - setup runtime
   - extract dataset
   - configuration
   - preprocessing
   - dataset and dataloader
   - model definitions
   - training utilities
   - inference and ensemble utilities
   - end-to-end run cell

The end-to-end run cell trains the selected models and writes the ensemble prediction CSV into `CKPT_DIR`.

### Option 2: Kaggle Notebook

1. Create a Kaggle Notebook with GPU enabled.
2. Attach the dataset archive and any pretrained weights through `Add data`.
3. Skip the Google Drive mount cell.
4. Update the configuration paths:

```python
TRAIN_DIR = Path("/kaggle/input/<dataset-name>")
TEST_DIR = Path("/kaggle/input/<test-dataset>/test_images")
CKPT_DIR = Path("/kaggle/working/checkpoint")
DINOV3_VITH_PT = Path("/kaggle/input/<weights>/dinov3_vith16plus_pretrain_lvd1689m-7c1da9a5.pth")
DINOV3_CNX_PT = Path("/kaggle/input/<weights>/dinov3_convnext_large_pretrain_lvd1689m-61fa432d.pth")
```

5. Run the remaining cells in order.

### Option 3: Local Jupyter

1. Create and activate a virtual environment:

```bash
python -m venv .venv-fsfm
python -m pip install --upgrade pip
```

Activate it with one of these commands:

```powershell
.\.venv-fsfm\Scripts\Activate.ps1
```

```bash
source .venv-fsfm/bin/activate
```

2. Install dependencies:

```bash
pip install numpy==2.4.4 torch==2.11.0 torchvision==0.26.0 timm==1.0.20 transformers==4.56.0 scikit-learn==1.8.0
pip install ultralytics==8.4.33 torchmetrics==1.9.0 albumentations==2.0.8 opencv-python pillow pandas matplotlib tqdm kagglehub huggingface_hub notebook ipykernel
python -m ipykernel install --user --name fsfm-venv --display-name "FSFM (.venv-fsfm)"
```

3. Pull Git LFS model files:

```bash
git lfs install
git lfs pull
```

4. Place data and weights:
   - `dataset_rotated.zip` in the repository root
   - test images in `test_images/`
   - DINOv3 pretrained `.pth` files in the repository root, or update the config paths

5. Start Jupyter:

```bash
jupyter notebook
```

6. Open `Modelling.ipynb`, select the `FSFM (.venv-fsfm)` kernel, skip the Google Drive mount cell, and run the rest in order.

## Running a Quick Smoke Test

Before full training, you can limit the notebook to a few steps. Set these environment variables before the configuration cell runs:

```python
import os
os.environ["FSFM_RUN_MODELS"] = "fsfm"
os.environ["FSFM_MAX_TRAIN_STEPS"] = "2"
os.environ["FSFM_MAX_VAL_STEPS"] = "2"
```

Then continue running the setup, config, model, training, and run cells. This checks that paths, dependencies, preprocessing, and model construction work without waiting for a full training run.

## Using Existing Checkpoints

The repo currently includes these saved artifacts under `model/`:

| File | Purpose |
|---|---|
| `dinov3_cnx.pt` | Saved DINOv3 ConvNeXt-Large checkpoint |
| `fsfm.pt` | Saved FSFM checkpoint |
| `probs_dinov3_cnx.npy` | Saved ConvNeXt prediction probabilities |
| `probs_dinov3_vith.npy` | Saved ViT-H+ prediction probabilities |
| `probs_fsfm.npy` | Saved FSFM prediction probabilities |

If you want the notebook to use the `model/` folder directly, change the checkpoint path in the configuration cell:

```python
CKPT_DIR = PROJECT_ROOT / "model"
```

The current repo snapshot does not include `model/dinov3_vith.pt`. To regenerate ViT-H predictions, add that checkpoint as `model/dinov3_vith.pt` or retrain the ViT-H model from the notebook.

For inference-only prediction, run the setup/config/preprocessing/model/inference cells first, then run the final prediction cell.

## How to Run `Data_Cleaning.ipynb`

Use this notebook when you want to rebuild the cleaned dataset from the original raw image data.

1. Set Kaggle credentials with environment variables or notebook secrets. Avoid hard-coding real credentials in the notebook.
2. Run the setup and dataset download cells.
3. Validate the raw train/test structure.
4. Run the distribution and sample visualization cells.
5. Run DINOv3 embedding extraction.
6. Run duplicate detection with cosine similarity.
7. Review duplicate and anomaly visualizations.
8. Run the duplicate-removal cell only after verifying the results.
9. Sync embeddings and recount the cleaned class distribution.
10. Copy or export the cleaned dataset.
11. Zip the cleaned class folders as `dataset_rotated.zip` for the modelling notebook.

The cleaning workflow is destructive once the duplicate-removal cell runs, because it deletes selected duplicate images from the working dataset folder. Keep a backup of the original dataset.

## Outputs

Typical output files include:

- `checkpoint/dinov3_cnx.pt`
- `checkpoint/fsfm.pt`
- `checkpoint/dinov3_vith.pt`
- `checkpoint/probs_<model>.npy`
- `checkpoint/<prediction-file>.csv`
- optional meta-layer prediction CSV variants

The exact output directory depends on `CKPT_DIR` in the modelling notebook.

## Security Notes

Do not commit real Kaggle keys, Hugging Face tokens, or Google Drive credentials. Use Colab secrets, Kaggle secrets, environment variables, or local config files that are excluded from git.
