import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
} from "motion/react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  Code2,
  Cpu,
  Github,
  Layers3,
  Menu,
  ScanFace,
  X,
} from "lucide-react";
import { Gallery } from "./components/Gallery";
import { ease, Reveal } from "./components/Reveal";
import { image, models, REPO } from "./data";

function Brand() {
  return (
    <a
      className="brand"
      href="#top"
      aria-label="Face Spoofing Detection — beranda"
    >
      <img
        src={`${import.meta.env.BASE_URL}brand/fsd-mark.svg`}
        width={40}
        height={40}
        alt=""
      />
      <span>
        Face Spoofing
        <span>
          Detection<span className="brand-dot">.</span>
        </span>
      </span>
    </a>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("");
  const root = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const pendingSection = useRef<string | null>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 180, damping: 30 });
  useEffect(() => {
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("main > section[id]"),
    );
    const update = () => {
      setScrolled(window.scrollY > 12);
      const marker = Math.max(120, innerHeight * 0.35);
      const current = sections.find((section) => {
        const rect = section.getBoundingClientRect();
        return rect.top <= marker && rect.bottom > marker;
      });
      setActive(current?.id === "model" ? "metode" : current?.id || "");
    };
    const dismiss = (event: KeyboardEvent) => {
      if (event.key === "Escape" && open) {
        setOpen(false);
        toggle.current?.focus();
      }
    };
    const outside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    document.addEventListener("keydown", dismiss);
    document.addEventListener("pointerdown", outside);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      document.removeEventListener("keydown", dismiss);
      document.removeEventListener("pointerdown", outside);
    };
  }, [open]);
  const links = [
    { id: "jenis-serangan", label: "Jenis serangan" },
    { id: "metode", label: "Metode" },
    { id: "riset", label: "Riset" },
  ];
  return (
    <header
      ref={root}
      className={`site-header${scrolled ? " is-scrolled" : ""}`}
    >
      <div className="container header-inner">
        <Brand />
        <nav className="desktop-nav" aria-label="Navigasi utama">
          {links.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className={active === link.id ? "active" : ""}
              aria-current={active === link.id ? "location" : undefined}
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="header-actions">
          <a
            className="button button-small button-dark"
            href={REPO}
            target="_blank"
            rel="noreferrer"
          >
            <Github size={16} />
            <span>Lihat kode</span>
            <ArrowUpRight size={15} />
          </a>
          <button
            className="menu-toggle icon-button"
            ref={toggle}
            onClick={() => setOpen(!open)}
            aria-label={open ? "Tutup navigasi" : "Buka navigasi"}
            aria-expanded={open}
            aria-controls="mobile-nav"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={String(open)}
                initial={{ opacity: 0, rotate: reduced ? 0 : -30 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: reduced ? 0 : 30 }}
                transition={{ duration: reduced ? 0 : 0.12 }}
              >
                {open ? <X size={21} /> : <Menu size={21} />}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
      </div>
      <AnimatePresence
        onExitComplete={() => {
          const target = pendingSection.current;
          if (!target) return;
          pendingSection.current = null;
          requestAnimationFrame(() =>
            document
              .getElementById(target)
              ?.scrollIntoView({
                behavior: reduced ? "instant" : "smooth",
                block: "start",
              }),
          );
        }}
      >
        {open && (
          <motion.nav
            id="mobile-nav"
            className="mobile-nav"
            aria-label="Navigasi seluler"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.25, ease }}
          >
            {links.map((link, index) => (
              <motion.a
                key={link.id}
                href={`#${link.id}`}
                onClick={(event) => {
                  if (
                    event.ctrlKey ||
                    event.metaKey ||
                    event.shiftKey ||
                    event.altKey
                  )
                    return;
                  event.preventDefault();
                  pendingSection.current = link.id;
                  window.history.pushState(null, "", `#${link.id}`);
                  setOpen(false);
                }}
                initial={reduced ? false : { opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: reduced ? 0 : index * 0.045 }}
              >
                {link.label}
                <ArrowUpRight size={17} />
              </motion.a>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
      <motion.div
        className="scroll-progress"
        aria-hidden="true"
        style={{ scaleX: reduced ? scrollYProgress : progress }}
      />
    </header>
  );
}

function Hero() {
  const reduced = useReducedMotion();
  const enter = (delay: number) => ({
    initial: reduced ? (false as const) : { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: reduced ? 0 : 0.7,
      delay: reduced ? 0 : delay,
      ease,
    },
  });
  return (
    <section className="hero container" aria-labelledby="hero-title">
      <div className="hero-copy">
        <motion.p className="eyebrow hero-eyebrow" {...enter(0)}>
          <span className="status-dot" />
          COMPUTER VISION / RESEARCH PROJECT
        </motion.p>
        <motion.h1 id="hero-title" {...enter(0.07)}>
          Wajah terlihat sama.
          <br />
          <span>Jejaknya berbeda.</span>
        </motion.h1>
        <motion.p className="hero-description" {...enter(0.14)}>
          Menelusuri perbedaan wajah asli dan serangan presentasi, melalui
          konteks gambar, detail wajah, dan tiga pendekatan model.
        </motion.p>
        <motion.div className="hero-actions" {...enter(0.21)}>
          <a className="button button-primary" href="#jenis-serangan">
            Eksplorasi contoh
            <ArrowRight size={18} />
          </a>
          <a className="button button-outline" href="#metode">
            Pelajari metode
            <ArrowDown size={17} />
          </a>
        </motion.div>
        <motion.div className="hero-facts" {...enter(0.28)}>
          <span>
            <strong>06</strong>Kelas visual
          </span>
          <span>
            <strong>02</strong>Sudut pandang
          </span>
          <span>
            <strong>03</strong>Cabang model
          </span>
        </motion.div>
      </div>
      <motion.div className="hero-visual" {...enter(0.18)}>
        <div className="hero-stage">
          <div className="hero-orbit" />
          <span className="hero-vertical-label">
            LOOK CLOSER. UNDERSTAND THE DIFFERENCE.
          </span>
          <img
            className="hero-person"
            src={image("01-hero-portrait")}
            width={1122}
            height={1402}
            alt="Perempuan memegang ponsel, ilustrasi visual identitas digital"
            fetchPriority="high"
          />
          <div className="face-brackets" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </div>
          <span className="hero-image-label">
            <ScanFace size={16} />
            Beyond the surface
          </span>
        </div>
        <motion.div className="hero-print" {...enter(0.45)}>
          <img
            src={image("03-printed-photo")}
            width={1254}
            height={1254}
            alt="Wajah yang sama pada foto cetak"
          />
          <span>
            <i />
            MEDIA BERBEDA
          </span>
        </motion.div>
        <span className="hero-figure-number">FIG. 01 — VISUAL IDENTITY</span>
      </motion.div>
    </section>
  );
}

function Method() {
  const [focus, setFocus] = useState(false);
  const reduced = useReducedMotion();
  return (
    <section
      className="method-section section-space"
      id="metode"
      aria-labelledby="method-title"
    >
      <div className="container method-grid">
        <Reveal className="method-copy">
          <p className="eyebrow">02 / DUA SUDUT PANDANG</p>
          <h2 id="method-title">
            Lihat konteksnya.
            <br />
            <span>Perhatikan detailnya.</span>
          </h2>
          <p>
            Bagian tepi gambar bisa bercerita. Detail wajah juga. Pipeline
            mempertahankan keduanya dalam dua tampilan yang saling melengkapi.
          </p>
          <div className="method-points">
            <div>
              <span>01</span>
              <div>
                <h3>Gambar penuh</h3>
                <p>
                  Mempertahankan konteks seperti bingkai layar, tepi kertas, dan
                  bentuk objek.
                </p>
              </div>
            </div>
            <div>
              <span>02</span>
              <div>
                <h3>Crop wajah</h3>
                <p>
                  Memusatkan perhatian pada tekstur dan detail lokal di area
                  wajah.
                </p>
              </div>
            </div>
          </div>
          <a
            className="text-link"
            href={`${REPO}/blob/main/docs/methodology.md`}
            target="_blank"
            rel="noreferrer"
          >
            Baca metodologi
            <ArrowUpRight size={17} />
          </a>
        </Reveal>
        <Reveal className="method-visual" delay={0.08}>
          <div className="method-view-toolbar">
            <span>
              <i />
              DUAL-VIEW INPUT
            </span>
            <div className="view-toggle" aria-label="Tampilan gambar metode">
              <button aria-pressed={!focus} onClick={() => setFocus(false)}>
                Gambar penuh
              </button>
              <button aria-pressed={focus} onClick={() => setFocus(true)}>
                Fokus wajah
              </button>
            </div>
          </div>
          <div className={`context-photo${focus ? " is-focused" : ""}`}>
            <motion.img
              src={image("09-dual-view-context")}
              width={1536}
              height={1024}
              loading="lazy"
              alt="Subjek wajah dengan konteks ponsel, meja, dan ruang di sekitarnya"
              animate={{ scale: focus ? 2.35 : 1 }}
              transition={{ duration: reduced ? 0 : 0.65, ease }}
            />
            <span className="context-frame" aria-hidden="true" />
            <span className="photo-label">
              {focus ? "Tampilan wajah" : "Tampilan penuh"}
            </span>
          </div>
          <div className="method-view-caption">
            <ScanFace size={19} />
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={String(focus)}
                initial={{ opacity: 0, y: reduced ? 0 : 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduced ? 0 : 0.16 }}
              >
                {focus
                  ? "Framing wajah memperjelas area yang dipelajari bersama konteks gambar."
                  : "Satu sumber gambar, dua tampilan untuk mempelajari petunjuk yang berbeda."}
              </motion.p>
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Models() {
  const [selected, setSelected] = useState(0);
  const model = models[selected];
  const reduced = useReducedMotion();
  const icons = [ScanFace, Layers3, Cpu];
  const Icon = icons[selected];
  return (
    <section
      className="models-section section-space"
      id="model"
      aria-labelledby="models-title"
    >
      <div className="container">
        <Reveal className="section-heading">
          <div>
            <p className="eyebrow">03 / PENDEKATAN YANG SALING MELENGKAPI</p>
            <h2 id="models-title">
              Tiga model.
              <br />
              <span>Satu penelusuran.</span>
            </h2>
          </div>
          <p className="heading-aside">
            Setiap cabang membawa cara membaca gambar yang berbeda.
            Probabilitasnya digabung pada tahap ensemble.
          </p>
        </Reveal>
        <Reveal className="model-layout">
          <div
            className="model-tabs"
            role="tablist"
            aria-label="Cabang model"
            aria-orientation="vertical"
          >
            {models.map((item, index) => (
              <button
                role="tab"
                key={item.id}
                id={`model-tab-${item.id}`}
                aria-controls="model-panel"
                aria-selected={selected === index}
                tabIndex={selected === index ? 0 : -1}
                onClick={() => setSelected(index)}
                onKeyDown={(event) => {
                  let next = index;
                  if (event.key === "ArrowDown")
                    next = (index + 1) % models.length;
                  else if (event.key === "ArrowUp")
                    next = (index + models.length - 1) % models.length;
                  else if (event.key === "Home") next = 0;
                  else if (event.key === "End") next = models.length - 1;
                  else return;
                  event.preventDefault();
                  setSelected(next);
                  document
                    .getElementById(`model-tab-${models[next].id}`)
                    ?.focus();
                }}
              >
                {selected === index && (
                  <motion.span
                    className="model-active-bg"
                    layoutId="model-active"
                    transition={{ duration: reduced ? 0 : 0.3, ease }}
                  />
                )}
                <span className="model-index">0{index + 1}</span>
                <span className="model-tab-copy">
                  <strong>{item.name}</strong>
                  <small>{item.tag}</small>
                </span>
                <ArrowUpRight size={20} />
              </button>
            ))}
          </div>
          <div
            id="model-panel"
            className="model-panel"
            role="tabpanel"
            aria-labelledby={`model-tab-${model.id}`}
            tabIndex={0}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={model.id}
                initial={{ opacity: 0, y: reduced ? 0 : 9 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduced ? 0 : -5 }}
                transition={{ duration: reduced ? 0 : 0.2, ease }}
              >
                <div className="model-panel-top">
                  <span className="model-symbol">
                    <Icon size={29} strokeWidth={1.5} />
                  </span>
                  <span className="eyebrow">BRANCH / 0{selected + 1}</span>
                </div>
                <h3>{model.title}</h3>
                <p>{model.copy}</p>
                <div className="model-specs">
                  <div>
                    <span>RESOLUSI INPUT</span>
                    <strong>
                      {model.resolution}
                      <small>px</small>
                    </strong>
                  </div>
                  <div>
                    <span>ADAPTASI MODEL</span>
                    <strong>{model.tuning}</strong>
                  </div>
                </div>
                <ul>
                  {model.facts.map((fact) => (
                    <li key={fact}>
                      <Check size={14} />
                      {fact}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Research() {
  return (
    <section
      className="research-section section-space"
      id="riset"
      aria-labelledby="research-title"
    >
      <div className="container research-grid">
        <Reveal className="research-photo">
          <img
            src={image("08-dataset-archive")}
            width={1536}
            height={1024}
            loading="lazy"
            alt="Arsip ilustratif berbagai potret dan media presentasi wajah"
          />
          <span className="research-photo-caption">
            DATA QUALITY / BEFORE THE MODEL
          </span>
        </Reveal>
        <Reveal className="research-copy" delay={0.07}>
          <p className="eyebrow">04 / DARI DATA KE EKSPERIMEN</p>
          <h2 id="research-title">
            Riset dimulai dari
            <br />
            <span>data yang ditinjau.</span>
          </h2>
          <p>
            Embedding DINOv3 membantu menelusuri kemiripan gambar. Duplikat
            ditinjau, lalu distribusi kelas diperiksa kembali sebelum modelling.
          </p>
          <div className="research-stats">
            <div>
              <strong>1.652</strong>
              <span>Gambar awal</span>
            </div>
            <span className="stats-arrow">
              <ArrowRight size={24} />
            </span>
            <div>
              <strong>1.427</strong>
              <span>Setelah deduplikasi</span>
            </div>
          </div>
          <p className="research-note">
            225 gambar duplikat dihapus pada eksperimen yang dicatat. Kandidat
            anomali ditandai untuk tinjauan manual.
          </p>
          <a
            className="text-link"
            href={`${REPO}/blob/main/notebooks/Data_Cleaning.ipynb`}
            target="_blank"
            rel="noreferrer"
          >
            Jelajahi notebook cleaning
            <ArrowUpRight size={17} />
          </a>
        </Reveal>
      </div>
    </section>
  );
}

function Questions() {
  const [open, setOpen] = useState<number | null>(null);
  const reduced = useReducedMotion();
  const questions = [
    {
      title: "Apakah galeri ini menjalankan deteksi?",
      copy: "Galeri ini menjelaskan jenis kelas menggunakan gambar sintetis berlabel. Eksplorasi kartu berjalan di browser tanpa mengirim gambar ke model. Pipeline training dan inferensi tersedia di notebook riset.",
    },
    {
      title: "Bagaimana pipeline menggabungkan ketiga model?",
      copy: "Setiap model membaca gambar penuh dan crop wajah, lalu menghasilkan probabilitas kelas. Inferensi memakai test-time augmentation; probabilitas ketiga cabang dirata-ratakan pada ensemble dasar.",
    },
    {
      title: "Apa yang tersedia di repositori?",
      copy: "Notebook cleaning dan modelling, checkpoint FSFM serta DINOv3 ConvNeXt melalui Git LFS, dan probabilitas tersimpan. Checkpoint ViT-H+ dan sebagian artefak meta-layer belum disertakan. Rincian kebutuhan tersedia dalam dokumentasi.",
    },
  ];
  return (
    <section
      className="questions-section container section-space"
      aria-labelledby="questions-title"
    >
      <Reveal className="questions-layout">
        <div>
          <p className="eyebrow">CATATAN PROYEK</p>
          <h2 id="questions-title">
            Sebelum
            <br />
            <span>menjelajah lebih jauh.</span>
          </h2>
        </div>
        <div className="faq-list">
          {questions.map((q, index) => (
            <div
              className={`faq-item${open === index ? " is-open" : ""}`}
              key={q.title}
            >
              <h3>
                <button
                  id={`faq-button-${index}`}
                  aria-expanded={open === index}
                  aria-controls={`faq-answer-${index}`}
                  onClick={() => setOpen(open === index ? null : index)}
                >
                  {q.title}
                  <ChevronDown size={19} />
                </button>
              </h3>
              <AnimatePresence initial={false}>
                {open === index && (
                  <motion.div
                    id={`faq-answer-${index}`}
                    role="region"
                    aria-labelledby={`faq-button-${index}`}
                    className="faq-answer"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: reduced ? 0 : 0.28, ease }}
                  >
                    <p>{q.copy}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

function Footer() {
  return (
    <>
      <Reveal className="container closing-wrap">
        <section className="closing-banner" aria-labelledby="closing-title">
          <div>
            <p className="eyebrow">BUKA KODE. TELUSURI PROSESNYA.</p>
            <h2 id="closing-title">
              Lihat lebih dekat
              <br />
              di balik eksperimen.
            </h2>
            <div className="closing-actions">
              <a
                className="button button-white"
                href={REPO}
                target="_blank"
                rel="noreferrer"
              >
                <Github size={17} />
                Jelajahi repositori
                <ArrowUpRight size={17} />
              </a>
              <a
                className="closing-docs"
                href={`${REPO}/blob/main/docs/development.md`}
                target="_blank"
                rel="noreferrer"
              >
                Dokumentasi
                <ArrowUpRight size={16} />
              </a>
            </div>
          </div>
          <img
            className="closing-camera"
            src={image("10-camera-cutout")}
            width={1448}
            height={1086}
            loading="lazy"
            alt="Kamera sebagai ilustrasi pengambilan citra"
          />
          <span className="closing-camera-label" aria-hidden="true">
            A CLOSER LOOK.
          </span>
        </section>
      </Reveal>
      <footer className="site-footer">
        <div className="container">
          <div className="footer-main">
            <div className="footer-brand">
              <Brand />
              <p>
                Menelusuri jejak visual di balik wajah.
                <br />
                Sebuah proyek riset face spoofing detection.
              </p>
              <span className="footer-project">
                <span className="status-dot" />
                OPEN RESEARCH PROJECT
              </span>
            </div>
            <nav aria-label="Jelajahi">
              <h2>Jelajahi</h2>
              <a href="#jenis-serangan">Galeri kelas</a>
              <a href="#metode">Pendekatan dual-view</a>
              <a href="#model">Cabang model</a>
            </nav>
            <nav aria-label="Riset dan kode">
              <h2>Riset & kode</h2>
              <a
                href={`${REPO}/blob/main/notebooks/Modelling.ipynb`}
                target="_blank"
                rel="noreferrer"
              >
                Notebook modelling
                <ArrowUpRight />
              </a>
              <a
                href={`${REPO}/blob/main/notebooks/Data_Cleaning.ipynb`}
                target="_blank"
                rel="noreferrer"
              >
                Notebook cleaning
                <ArrowUpRight />
              </a>
              <a
                href={`${REPO}/blob/main/docs/methodology.md`}
                target="_blank"
                rel="noreferrer"
              >
                Metodologi
                <ArrowUpRight />
              </a>
            </nav>
            <nav aria-label="Proyek">
              <h2>Proyek</h2>
              <a
                href="https://github.com/Ditt-A"
                target="_blank"
                rel="noreferrer"
              >
                Ditt-A
                <ArrowUpRight />
              </a>
              <a href={REPO} target="_blank" rel="noreferrer">
                GitHub
                <ArrowUpRight />
              </a>
              <a href={`${REPO}/issues`} target="_blank" rel="noreferrer">
                Diskusi & masukan
                <ArrowUpRight />
              </a>
            </nav>
          </div>
          <div className="footer-bottom">
            <p>© {new Date().getFullYear()} Face Spoofing Detection.</p>
            <p>Gambar ilustratif sintetis · Proyek riset</p>
            <a href="#top">
              Kembali ke atas
              <ArrowUpRight size={14} />
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <div id="top">
        <a className="skip-link" href="#main-content">
          Langsung ke konten
        </a>
        <Header />
        <main id="main-content" tabIndex={-1}>
          <Hero />
          <div className="model-strip container">
            <span>DIBANGUN DENGAN</span>
            <div>
              <span>
                <ScanFace size={20} />
                DINOv3
              </span>
              <span>
                <Layers3 size={20} />
                ConvNeXt
              </span>
              <span>
                <Cpu size={20} />
                FSFM
              </span>
              <span>
                <Code2 size={20} />
                PyTorch
              </span>
            </div>
          </div>
          <Gallery />
          <Method />
          <Models />
          <Research />
          <Questions />
        </main>
        <Footer />
      </div>
    </MotionConfig>
  );
}
