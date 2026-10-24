export const REPO = "https://github.com/Ditt-A/Face-Spoofing-Detection";
export const image = (name: string) =>
  `${import.meta.env.BASE_URL}assets/images/${name}.webp`;
export const galleryItems = [
  {
    id: "realperson",
    name: "Wajah asli",
    category: "real",
    image: "02-real-person",
    caption: "Manusia di depan kamera.",
    description:
      "Wajah manusia menjadi kelas pembanding terhadap lima kategori serangan presentasi.",
    detail:
      "Dalam riset ini, citra diklasifikasikan sebagai realperson. Foto diam tetap memiliki keterbatasan; contoh ini menjelaskan label kelas, bukan bukti liveness.",
    cues: [
      "Detail dan tekstur wajah",
      "Konteks pengambilan gambar",
      "Pembanding untuk kelas spoof",
    ],
    number: "01",
  },
  {
    id: "fake_printed",
    name: "Foto cetak",
    category: "spoof",
    image: "03-printed-photo",
    caption: "Wajah pada selembar kertas.",
    description:
      "Foto wajah yang dicetak dapat digunakan sebagai media serangan presentasi.",
    detail:
      "Tepi kertas, tekstur cetakan, dan konteks di sekitar wajah menjadi informasi visual yang dapat dipelajari model. Gambar penuh membantu mempertahankan petunjuk tersebut.",
    cues: [
      "Tepi dan lengkungan kertas",
      "Tekstur permukaan cetak",
      "Konteks di sekitar wajah",
    ],
    number: "02",
  },
  {
    id: "fake_screen",
    name: "Layar ponsel",
    category: "spoof",
    image: "04-screen-replay",
    caption: "Potret di balik permukaan layar.",
    description:
      "Wajah yang ditampilkan melalui perangkat merupakan bentuk serangan berbasis layar.",
    detail:
      "Bingkai perangkat dan pantulan kaca memberi konteks tambahan. Detail lokal pada wajah juga dapat berbeda ketika gambar direproduksi oleh layar.",
    cues: [
      "Bingkai perangkat",
      "Pantulan permukaan kaca",
      "Pola reproduksi gambar",
    ],
    number: "03",
  },
  {
    id: "fake_mask",
    name: "Masker wajah",
    category: "spoof",
    image: "05-silicone-mask",
    caption: "Bentuk wajah, material berbeda.",
    description:
      "Replika wajah berupa masker menjadi kategori serangan tersendiri.",
    detail:
      "Ilustrasi masker silikon ini memperlihatkan perbedaan material, detail permukaan, dan batas masker. Bentuk serta bahan masker pada dataset dapat bervariasi.",
    cues: [
      "Material permukaan",
      "Batas dan sambungan masker",
      "Detail bentuk wajah",
    ],
    number: "04",
  },
  {
    id: "fake_mannequin",
    name: "Manekin",
    category: "spoof",
    image: "06-mannequin",
    caption: "Objek yang menyerupai manusia.",
    description: "Kepala atau figur artifisial yang menyerupai wajah manusia.",
    detail:
      "Manekin memberi contoh wajah dengan struktur menyerupai manusia, tetapi memiliki bahan dan tekstur artifisial. Informasi lokal dan konteks objek sama-sama relevan.",
    cues: [
      "Tekstur artifisial",
      "Struktur kepala dan leher",
      "Konteks objek di sekitarnya",
    ],
    number: "05",
  },
  {
    id: "fake_unknown",
    name: "Presentasi lain",
    category: "spoof",
    image: "07-mixed-presentation",
    caption: "Bentuk serangan yang beragam.",
    description: "Kategori untuk pola spoof lain atau campuran pada dataset.",
    detail:
      "Konstruksi kertas di atas layar ini merupakan salah satu ilustrasi presentasi campuran. Kategori fake_unknown mencakup variasi lain dan tidak terbatas pada contoh ini.",
    cues: [
      "Kombinasi beberapa media",
      "Pola yang tidak seragam",
      "Konteks visual yang beragam",
    ],
    number: "06",
  },
] as const;
export type GalleryItem = (typeof galleryItems)[number];
export const models = [
  {
    id: "vith",
    name: "DINOv3 ViT-H+",
    tag: "Representasi visual",
    resolution: "448 × 448",
    tuning: "LoRA",
    title: "Membaca pola visual secara menyeluruh.",
    copy: "Model fondasi visual mengolah gambar penuh dan crop wajah. Fitur kedua sudut pandang digabung sebelum masuk ke kepala klasifikasi.",
    facts: ["Input RGB", "LoRA rank 8", "Fusi fitur dua tampilan"],
  },
  {
    id: "cnx",
    name: "ConvNeXt-Large",
    tag: "Spasial & frekuensi",
    resolution: "384 × 384",
    tuning: "Fine-tuning",
    title: "Melihat detail dari ruang dan frekuensi.",
    copy: "Cabang DINOv3 ConvNeXt menggabungkan RGB dan kanal FFT menjadi input enam kanal untuk mempelajari pola spasial serta artefak frekuensi.",
    facts: ["Input RGB + FFT", "Enam kanal", "Fusi fitur dua tampilan"],
  },
  {
    id: "fsfm",
    name: "FSFM ViT-B/16",
    tag: "Representasi wajah",
    resolution: "224 × 224",
    tuning: "LoRA",
    title: "Memberi perhatian khusus pada wajah.",
    copy: "Cabang FSFM membawa representasi yang dilatih khusus untuk wajah, dengan normalisasi dari pretraining dan adaptasi LoRA pada tugas klasifikasi.",
    facts: ["Pretraining wajah", "Normalisasi FSFM", "LoRA rank 8"],
  },
] as const;
