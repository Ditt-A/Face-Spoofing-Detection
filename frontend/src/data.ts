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
    description: "Wajah manusia yang menjadi subjek pemeriksaan identitas.",
    detail:
      "Keaslian wajah perlu diperhatikan bersama konteks gambarnya. Contoh ini memperlihatkan potret seseorang untuk dibandingkan dengan wajah yang direproduksi melalui media lain.",
    cues: [
      "Detail dan tekstur wajah",
      "Konteks pengambilan gambar",
      "Keutuhan tampilan wajah",
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
      "Foto cetak dapat terlihat meyakinkan saat diarahkan ke kamera. Tepi kertas, lengkungan, dan tekstur cetakan membantu memperlihatkan bahwa wajah berasal dari sebuah reproduksi.",
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
      "Masker dapat meniru bentuk wajah seseorang. Bahan permukaan, sambungan, dan batas di sekitar wajah menjadi detail yang perlu diperhatikan saat meninjau keasliannya.",
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
      "Bentuk kepala dan fitur wajah pada manekin dapat menyerupai manusia. Material permukaan serta bentuk leher dan area sekitarnya membantu memperlihatkan sifat artifisial objek.",
    cues: [
      "Tekstur artifisial",
      "Struktur kepala dan leher",
      "Konteks objek di sekitarnya",
    ],
    number: "05",
  },
  {
    id: "fake_unknown",
    name: "Pemalsuan lain",
    category: "spoof",
    image: "07-mixed-presentation",
    caption: "Bentuk serangan yang beragam.",
    description: "Pemalsuan wajah dapat menggunakan gabungan beberapa media.",
    detail:
      "Contoh ini menggabungkan potongan foto dan layar. Bentuk pemalsuan dapat beragam, sehingga detail wajah perlu dilihat bersama media dan konteks di sekitarnya.",
    cues: [
      "Kombinasi beberapa media",
      "Pola yang tidak seragam",
      "Konteks visual yang beragam",
    ],
    number: "06",
  },
] as const;
export type GalleryItem = (typeof galleryItems)[number];
export const useCases = [
  {
    id: "registration",
    name: "Pendaftaran akun",
    tag: "Saat pengguna baru bergabung",
    stage: "Pendaftaran",
    focus: "Keaslian wajah",
    title: "Tambahkan pemeriksaan saat akun dibuat.",
    copy: "Pada pendaftaran berbasis foto wajah, tinjau apakah gambar menampilkan manusia atau reproduksi melalui media lain sebelum melanjutkan peninjauan identitas.",
    facts: [
      "Foto pendaftaran",
      "Indikasi media tiruan",
      "Peninjauan identitas",
    ],
  },
  {
    id: "verification",
    name: "Verifikasi identitas",
    tag: "Saat identitas ditinjau",
    stage: "Verifikasi",
    focus: "Media presentasi",
    title: "Lihat lebih dari kemiripan potret.",
    copy: "Potret yang terlihat cocok tetap dapat ditampilkan lewat kertas, layar, atau replika. Pemeriksaan citra membantu meninjau media yang digunakan dalam proses verifikasi.",
    facts: ["Konteks gambar", "Detail wajah", "Media presentasi"],
  },
  {
    id: "access",
    name: "Akses layanan",
    tag: "Saat verifikasi menjadi syarat",
    stage: "Pemberian akses",
    focus: "Indikasi pemalsuan",
    title: "Lengkapi verifikasi sebelum memberi akses.",
    copy: "Untuk layanan yang menggunakan verifikasi wajah, pemeriksaan indikasi pemalsuan dapat menjadi salah satu pertimbangan bersama mekanisme keamanan lainnya.",
    facts: ["Verifikasi wajah", "Tinjauan tambahan", "Keputusan akses"],
  },
] as const;
