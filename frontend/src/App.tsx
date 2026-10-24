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
  Image as ImageIcon,
  Smartphone,
  Box,
  UserRound,
  KeyRound,
  Layers3,
  Menu,
  ScanFace,
  X,
} from "lucide-react";
import { Gallery } from "./components/Gallery";
import { Simulation } from "./components/Simulation";
import { ease, Reveal } from "./components/Reveal";
import { image, useCases, REPO } from "./data";

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
      setActive(current?.id === "pendekatan" ? "metode" : current?.id || "");
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
    { id: "metode", label: "Cara kerja" },
    { id: "penggunaan", label: "Penggunaan" },
    { id: "simulasi", label: "Simulasi" },
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
          <a className="button button-small button-dark" href="#simulasi">
            <ScanFace size={16} />
            <span>Coba simulasi</span>
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
            document.getElementById(target)?.scrollIntoView({
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
          FACE SPOOFING DETECTION
        </motion.p>
        <motion.h1 id="hero-title" {...enter(0.07)}>
          Kenali wajah asli.
          <br />
          <span>Waspadai tiruannya.</span>
        </motion.h1>
        <motion.p className="hero-description" {...enter(0.14)}>
          Bantu proses verifikasi mengenali wajah asli dan upaya pemalsuan
          melalui foto, layar, masker, atau objek yang menyerupai wajah.
        </motion.p>
        <motion.div className="hero-actions" {...enter(0.21)}>
          <a className="button button-primary" href="#jenis-serangan">
            Eksplorasi contoh
            <ArrowRight size={18} />
          </a>
          <a className="button button-outline" href="#simulasi">
            Coba simulasi
            <ArrowDown size={17} />
          </a>
        </motion.div>
        <motion.div className="hero-facts" {...enter(0.28)}>
          <span>
            <ImageIcon size={17} />
            Foto & layar
          </span>
          <span>
            <ScanFace size={17} />
            Masker & replika
          </span>
          <span>
            <Layers3 size={17} />
            Konteks & detail
          </span>
        </motion.div>
      </div>
      <motion.div className="hero-visual" {...enter(0.18)}>
        <div className="hero-stage">
          <div className="hero-orbit" />
          <span className="hero-vertical-label">
            KEASLIAN WAJAH PERLU DIPERHATIKAN.
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
            Periksa keaslian wajah
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
        <span className="hero-figure-number">
          KENALI WAJAH DAN MEDIA DI BALIKNYA
        </span>
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
          <p className="eyebrow">02 / CARA KERJA</p>
          <h2 id="method-title">
            Lihat konteksnya.
            <br />
            <span>Perhatikan detailnya.</span>
          </h2>
          <p>
            Tepi kertas, bingkai perangkat, dan tekstur wajah bisa memberi
            petunjuk yang berbeda. Pemeriksaan memperhatikan gambar secara
            menyeluruh sekaligus detail di area wajah.
          </p>
          <div className="method-points">
            <div>
              <span>01</span>
              <div>
                <h3>Konteks di sekitar wajah</h3>
                <p>
                  Perhatikan media yang digunakan, termasuk bingkai layar, tepi
                  kertas, dan bentuk objek.
                </p>
              </div>
            </div>
            <div>
              <span>02</span>
              <div>
                <h3>Detail pada wajah</h3>
                <p>
                  Tinjau tekstur dan detail permukaan yang bisa menunjukkan
                  reproduksi atau bahan artifisial.
                </p>
              </div>
            </div>
          </div>
          <a className="text-link" href="#jenis-serangan">
            Lihat contoh perbedaannya
            <ArrowUpRight size={17} />
          </a>
        </Reveal>
        <Reveal className="method-visual" delay={0.08}>
          <div className="method-view-toolbar">
            <span>
              <i />
              KONTEKS & DETAIL
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
                  ? "Lihat lebih dekat tekstur dan detail pada area wajah."
                  : "Perhatikan wajah sekaligus media dan area di sekitarnya."}
              </motion.p>
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function UseCases() {
  const [selected, setSelected] = useState(0);
  const useCase = useCases[selected];
  const reduced = useReducedMotion();
  const icons = [UserRound, ScanFace, KeyRound];
  const Icon = icons[selected];
  return (
    <section
      className="models-section section-space"
      id="penggunaan"
      aria-labelledby="models-title"
    >
      <div className="container">
        <Reveal className="section-heading">
          <div>
            <p className="eyebrow">03 / UNTUK LAYANAN ANDA</p>
            <h2 id="models-title">
              Saat identitas penting,
              <br />
              <span>periksa keasliannya.</span>
            </h2>
          </div>
          <p className="heading-aside">
            Dari pendaftaran hingga pemberian akses, pemeriksaan wajah dapat
            melengkapi proses peninjauan identitas di layanan Anda.
          </p>
        </Reveal>
        <Reveal className="model-layout">
          <div
            className="model-tabs"
            role="tablist"
            aria-label="Kebutuhan layanan"
            aria-orientation="vertical"
          >
            {useCases.map((item, index) => (
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
                    next = (index + 1) % useCases.length;
                  else if (event.key === "ArrowUp")
                    next = (index + useCases.length - 1) % useCases.length;
                  else if (event.key === "Home") next = 0;
                  else if (event.key === "End") next = useCases.length - 1;
                  else return;
                  event.preventDefault();
                  setSelected(next);
                  document
                    .getElementById(`model-tab-${useCases[next].id}`)
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
            aria-labelledby={`model-tab-${useCase.id}`}
            tabIndex={0}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={useCase.id}
                initial={{ opacity: 0, y: reduced ? 0 : 9 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduced ? 0 : -5 }}
                transition={{ duration: reduced ? 0 : 0.2, ease }}
              >
                <div className="model-panel-top">
                  <span className="model-symbol">
                    <Icon size={29} strokeWidth={1.5} />
                  </span>
                  <span className="eyebrow">PENGGUNAAN / 0{selected + 1}</span>
                </div>
                <h3>{useCase.title}</h3>
                <p>{useCase.copy}</p>
                <div className="model-specs">
                  <div>
                    <span>TAHAP LAYANAN</span>
                    <strong>{useCase.stage}</strong>
                  </div>
                  <div>
                    <span>FOKUS PEMERIKSAAN</span>
                    <strong>{useCase.focus}</strong>
                  </div>
                </div>
                <ul>
                  {useCase.facts.map((fact) => (
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

function Verification() {
  return (
    <section
      className="research-section section-space"
      id="pendekatan"
      aria-labelledby="research-title"
    >
      <div className="container research-grid">
        <Reveal className="research-photo">
          <img
            src={image("08-dataset-archive")}
            width={1536}
            height={1024}
            loading="lazy"
            alt="Ilustrasi berbagai wajah dan media pemalsuan identitas"
          />
          <span className="research-photo-caption">
            KEASLIAN DI BALIK SETIAP IDENTITAS
          </span>
        </Reveal>
        <Reveal className="research-copy" delay={0.07}>
          <p className="eyebrow">04 / LENGKAPI VERIFIKASI ANDA</p>
          <h2 id="research-title">
            Tambahkan lapisan
            <br />
            <span>pemeriksaan wajah.</span>
          </h2>
          <p>
            Foto, layar, dan objek tiruan dapat menyerupai pengguna asli.
            Perhatikan konteks dan detail pada gambar untuk meninjau indikasi
            pemalsuan dalam alur verifikasi Anda.
          </p>
          <ul className="client-checks">
            <li>
              <Check size={16} />
              Kenali media pemalsuan wajah
            </li>
            <li>
              <Check size={16} />
              Tinjau konteks dan detail gambar
            </li>
            <li>
              <Check size={16} />
              Lengkapi keputusan verifikasi
            </li>
          </ul>
          <a className="text-link" href="#penggunaan">
            Temukan contoh penggunaan
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
      title: "Apa itu pemalsuan wajah?",
      copy: "Pemalsuan wajah adalah upaya memakai foto, layar, masker, atau objek menyerupai wajah untuk meniru seseorang dalam proses verifikasi. Bentuknya dapat beragam, sehingga media dan detail wajah perlu diperhatikan bersama.",
    },
    {
      title: "Apa yang bisa saya lihat di galeri ini?",
      copy: "Anda dapat membandingkan sampel wajah asli dengan foto cetak, layar, masker, manekin, dan representasi lainnya dari dataset. Pilih kartu untuk melihat detail. Galeri ini tidak mengunggah atau memeriksa foto pribadi Anda.",
    },
    {
      title: "Apakah pemeriksaan wajah memastikan identitas seseorang?",
      copy: "Pemeriksaan keaslian gambar membantu meninjau indikasi pemalsuan. Penetapan identitas tetap memerlukan pemeriksaan lain sesuai kebutuhan layanan Anda.",
    },
  ];
  return (
    <section
      className="questions-section container section-space"
      id="pertanyaan"
      aria-labelledby="questions-title"
    >
      <Reveal className="questions-layout">
        <div>
          <p className="eyebrow">PERTANYAAN UMUM</p>
          <h2 id="questions-title">
            Kenali lebih jauh
            <br />
            <span>pemeriksaan wajah.</span>
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
            <p className="eyebrow">PERHATIKAN KEASLIAN DI BALIK WAJAH.</p>
            <h2 id="closing-title">
              Kenali risikonya.
              <br />
              Perkuat verifikasi wajah.
            </h2>
            <div className="closing-actions">
              <a className="button button-white" href="#jenis-serangan">
                <ScanFace size={17} />
                Kenali jenis serangannya
                <ArrowRight size={17} />
              </a>
              <a className="closing-docs" href="#metode">
                Cara kerja
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
                Kenali wajah asli dan upaya pemalsuannya.
                <br />
                Lengkapi proses verifikasi identitas Anda.
              </p>
              <span className="footer-project">
                <span className="status-dot" />
                FACE SPOOFING DETECTION
              </span>
            </div>
            <nav aria-label="Jelajahi">
              <h2>Jelajahi</h2>
              <a href="#jenis-serangan">Jenis serangan</a>
              <a href="#metode">Cara kerja</a>
              <a href="#penggunaan">Contoh penggunaan</a>
              <a href="#simulasi">Simulasi pemeriksaan</a>
            </nav>
            <nav aria-label="Pelajari">
              <h2>Pelajari</h2>
              <a href="#galeri-kelas">Galeri contoh</a>
              <a href="#pendekatan">Pemeriksaan wajah</a>
              <a href="#pertanyaan">Pertanyaan umum</a>
            </nav>
            <nav aria-label="Informasi">
              <h2>Informasi</h2>
              <a
                href="https://github.com/Ditt-A"
                target="_blank"
                rel="noreferrer"
              >
                Pengembang
                <ArrowUpRight />
              </a>
              <a
                href={`${REPO}/blob/main/docs/methodology.md`}
                target="_blank"
                rel="noreferrer"
              >
                Dokumentasi teknis
                <ArrowUpRight />
              </a>
              <a href={`${REPO}/issues`} target="_blank" rel="noreferrer">
                Sampaikan masukan
                <ArrowUpRight />
              </a>
            </nav>
          </div>
          <div className="footer-bottom">
            <p>© {new Date().getFullYear()} Face Spoofing Detection.</p>
            <p>
              Galeri memakai sampel dataset. Visual pendukung bersifat
              ilustratif.
            </p>
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
  useEffect(() => {
    const initialHash = window.location.hash;
    if (!initialHash) return;
    let active = true;
    void document.fonts.ready.then(() => {
      if (active && window.location.hash === initialHash) {
        document
          .getElementById(initialHash.slice(1))
          ?.scrollIntoView({ behavior: "instant", block: "start" });
      }
    });
    return () => {
      active = false;
    };
  }, []);
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
            <span>KENALI MEDIA PEMALSUAN</span>
            <div>
              <span>
                <ImageIcon size={20} />
                Foto cetak
              </span>
              <span>
                <Smartphone size={20} />
                Layar perangkat
              </span>
              <span>
                <ScanFace size={20} />
                Masker wajah
              </span>
              <span>
                <Box size={20} />
                Manekin
              </span>
            </div>
          </div>
          <Gallery />
          <Method />
          <Simulation />
          <UseCases />
          <Verification />
          <Questions />
        </main>
        <Footer />
      </div>
    </MotionConfig>
  );
}
