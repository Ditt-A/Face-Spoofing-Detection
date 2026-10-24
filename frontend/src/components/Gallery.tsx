import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  Expand,
  X,
} from "lucide-react";
import { galleryItems, image, type GalleryItem } from "../data";
import { ease, Reveal } from "./Reveal";

function GalleryDetail({
  item,
  index,
  close,
  move,
}: {
  item: GalleryItem;
  index: number;
  close: () => void;
  move: (direction: number) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    const node = dialog.current!;
    const origin = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    node.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      node.close();
      document.body.style.overflow = previousOverflow;
      origin?.focus({ preventScroll: true });
    };
  }, []);
  return (
    <motion.dialog
      ref={dialog}
      className="gallery-dialog"
      aria-labelledby="detail-title"
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          const rect = event.currentTarget.getBoundingClientRect();
          if (
            event.clientX < rect.left ||
            event.clientX > rect.right ||
            event.clientY < rect.top ||
            event.clientY > rect.bottom
          )
            close();
        }
      }}
      onKeyDown={(event) => {
        if (event.key === "Tab") {
          const controls = Array.from(
            event.currentTarget.querySelectorAll<HTMLElement>(
              'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
            ),
          ).filter((node) => node.getClientRects().length > 0);
          const first = controls[0];
          const last = controls[controls.length - 1];
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last?.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first?.focus();
          }
        }
        if (event.target instanceof HTMLInputElement) return;
        if (event.key === "ArrowRight") {
          event.preventDefault();
          move(1);
        }
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          move(-1);
        }
      }}
      initial={{ opacity: 0, y: reduced ? 0 : 18, scale: reduced ? 1 : 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: reduced ? 0 : 10, scale: reduced ? 1 : 0.985 }}
      transition={{ duration: reduced ? 0 : 0.25, ease }}
    >
      <button
        className="dialog-close icon-button"
        aria-label="Tutup detail"
        onClick={close}
        autoFocus
      >
        <X size={21} />
      </button>
      <div className="detail-image">
        <AnimatePresence mode="wait" initial={false}>
          <motion.img
            key={item.id}
            src={image(item.image)}
            width={1254}
            height={1254}
            alt={item.name}
            initial={{ opacity: 0, scale: reduced ? 1 : 1.025 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.22 }}
          />
        </AnimatePresence>
        <span className="detail-image-note">CONTOH VISUAL SINTETIS</span>
      </div>
      <div className="detail-copy">
        <span className="eyebrow">MENGENAL KELAS / {item.number}</span>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: reduced ? 0 : 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.18 }}
          >
            <span className={`class-badge ${item.category}`}>
              {item.category === "real" ? "Wajah asli" : "Serangan presentasi"}
            </span>
            <h2 id="detail-title">{item.name}</h2>
            <code>{item.id}</code>
            <p className="detail-description">{item.description}</p>
            <p>{item.detail}</p>
            <h3>Petunjuk visual untuk dipahami</h3>
            <ul>
              {item.cues.map((cue) => (
                <li key={cue}>
                  <Check size={15} />
                  {cue}
                </li>
              ))}
            </ul>
          </motion.div>
        </AnimatePresence>
        <div className="detail-navigation">
          <span>
            <strong>{String(index + 1).padStart(2, "0")}</strong> / 06
          </span>
          <div>
            <button
              className="icon-button"
              onClick={() => move(-1)}
              aria-label="Contoh sebelumnya"
            >
              <ArrowLeft size={20} />
            </button>
            <button
              className="icon-button"
              onClick={() => move(1)}
              aria-label="Contoh berikutnya"
            >
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </motion.dialog>
  );
}

export function Gallery() {
  const [filter, setFilter] = useState("all");
  const [active, setActive] = useState<number | null>(null);
  const reduced = useReducedMotion();
  const visibleItems = galleryItems.filter(
    (item) => filter === "all" || item.category === filter,
  );
  return (
    <section
      className="gallery-section section-space"
      id="jenis-serangan"
      aria-labelledby="gallery-title"
    >
      <div className="container">
        <Reveal className="section-heading gallery-heading">
          <div>
            <p className="eyebrow">01 / KENALI PERBEDAANNYA</p>
            <h2 id="gallery-title">
              Satu wajah.
              <br />
              <span>Banyak kemungkinan.</span>
            </h2>
          </div>
          <div className="heading-aside">
            <p>
              Kenali enam kelas yang dipelajari model. Buka setiap kartu untuk
              melihat detail dan konteks visualnya.
            </p>
            <a className="text-link" href="#galeri-kelas">
              Jelajahi galeri <ArrowDown size={16} />
            </a>
          </div>
        </Reveal>
        <div className="gallery-toolbar" id="galeri-kelas">
          <div className="filter-list" aria-label="Filter galeri">
            {[
              { id: "all", label: "Semua", count: 6 },
              { id: "real", label: "Wajah asli", count: 1 },
              { id: "spoof", label: "Serangan", count: 5 },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                aria-pressed={filter === tab.id}
              >
                {filter === tab.id && (
                  <motion.span
                    className="filter-background"
                    layoutId="gallery-filter"
                    transition={{
                      type: "spring",
                      stiffness: 440,
                      damping: 38,
                      duration: reduced ? 0 : undefined,
                    }}
                  />
                )}
                <span>
                  {tab.label} <small>{tab.count}</small>
                </span>
              </button>
            ))}
          </div>
          <span className="gallery-count" role="status">
            {visibleItems.length} contoh visual
          </span>
        </div>
        <motion.div
          className="gallery-grid"
          layout
          transition={{ duration: reduced ? 0 : 0.35, ease }}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {visibleItems.map((item, index) => (
              <motion.button
                layout
                key={item.id}
                className="gallery-card"
                aria-label={`Lihat detail ${item.name}`}
                onClick={() =>
                  setActive(
                    galleryItems.findIndex(
                      (candidate) => candidate.id === item.id,
                    ),
                  )
                }
                initial={reduced ? false : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                exit={{ opacity: 0, scale: reduced ? 1 : 0.96 }}
                transition={{
                  duration: reduced ? 0 : 0.35,
                  ease,
                  opacity: {
                    delay: reduced ? 0 : Math.min(index * 0.045, 0.18),
                  },
                }}
              >
                <div className="card-photo">
                  <img
                    src={image(item.image)}
                    width={1254}
                    height={1254}
                    loading="lazy"
                    decoding="async"
                    alt={item.caption}
                  />
                  <span className="card-number">{item.number}</span>
                  <span className="card-open">
                    <Expand size={16} />
                    Lihat detail
                  </span>
                </div>
                <div className="card-caption">
                  <div>
                    <span className={`class-category ${item.category}`}>
                      <i />
                      {item.category === "real"
                        ? "GENUINE"
                        : "PRESENTATION ATTACK"}
                    </span>
                    <h3>{item.name}</h3>
                    <p>{item.caption}</p>
                  </div>
                  <span className="card-arrow">
                    <ArrowUpRight size={21} />
                  </span>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </motion.div>
        <p className="gallery-footnote">
          Gambar ilustratif. Label menjelaskan jenis contoh, bukan hasil
          inferensi model.
        </p>
        <AnimatePresence>
          {active !== null && (
            <GalleryDetail
              item={galleryItems[active]}
              index={active}
              close={() => setActive(null)}
              move={(direction) =>
                setActive((previous) =>
                  previous === null
                    ? null
                    : (previous + direction + galleryItems.length) %
                      galleryItems.length,
                )
              }
            />
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
