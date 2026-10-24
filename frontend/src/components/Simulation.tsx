import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  Check,
  CheckCheck,
  ChevronRight,
  CircleAlert,
  Info,
  LoaderCircle,
  RotateCcw,
  ScanFace,
  ShieldCheck,
  ShieldAlert,
  WifiOff,
} from "lucide-react";
import { galleryItems, image } from "../data";
import {
  apiRequest,
  type AnalysisResult,
  type ApiHealth,
  type ClassLabel,
  type Example,
} from "../lib/api";
import { ease, Reveal } from "./Reveal";

const initialExamples: Example[] = galleryItems.map((item) => ({
  id: item.id,
  title: item.name,
  image_name: item.image,
  width: 1254,
  height: 1254,
  summary: item.description,
  observations: [...item.cues],
}));

export function Simulation() {
  const [examples, setExamples] = useState<Example[]>(initialExamples);
  const [selected, setSelected] = useState<ClassLabel>("realperson");
  const [health, setHealth] = useState<ApiHealth | null>(null);
  const [connection, setConnection] = useState<
    "connecting" | "ready" | "offline"
  >("connecting");
  const [phase, setPhase] = useState<"idle" | "running" | "complete" | "error">(
    "idle",
  );
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");
  const [connectAttempt, setConnectAttempt] = useState(0);
  const request = useRef<AbortController | null>(null);
  const sequence = useRef(0);
  const reduced = useReducedMotion();
  const example = examples.find((item) => item.id === selected) || examples[0];

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      setConnection("offline");
      controller.abort();
    }, 10_000);
    setConnection("connecting");
    Promise.all([
      apiRequest<ApiHealth>("health", { signal: controller.signal }),
      apiRequest<{ examples: Example[] }>("examples", {
        signal: controller.signal,
      }),
    ])
      .then(([status, catalog]) => {
        if (controller.signal.aborted) return;
        if (!catalog.examples.length) throw new Error("Empty catalog");
        setHealth(status);
        setExamples(catalog.examples);
        setConnection("ready");
      })
      .catch(() => {
        if (!controller.signal.aborted) setConnection("offline");
      })
      .finally(() => clearTimeout(timeout));
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [connectAttempt]);

  useEffect(
    () => () => {
      sequence.current++;
      request.current?.abort();
    },
    [],
  );

  const chooseExample = useCallback((id: ClassLabel) => {
    sequence.current++;
    request.current?.abort();
    request.current = null;
    setSelected(id);
    setPhase("idle");
    setResult(null);
    setError("");
  }, []);

  async function analyze() {
    if (phase === "running" || connection !== "ready") return;
    const current = ++sequence.current;
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    let timedOut = false;
    const timeout = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, 20_000);
    setPhase("running");
    setError("");
    setResult(null);
    try {
      const [analysis] = await Promise.all([
        apiRequest<AnalysisResult>("analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ example_id: selected }),
          signal: controller.signal,
        }),
        new Promise<void>((resolve) => setTimeout(resolve, reduced ? 0 : 650)),
      ]);
      if (current !== sequence.current || controller.signal.aborted) return;
      setResult(analysis);
      setPhase("complete");
    } catch (issue) {
      if (
        current !== sequence.current ||
        (controller.signal.aborted && !timedOut)
      )
        return;
      setError(
        timedOut
          ? "Pemeriksaan memerlukan waktu lebih lama. Silakan coba kembali."
          : issue instanceof Error
            ? issue.message
            : "Pemeriksaan belum selesai. Silakan coba kembali.",
      );
      setPhase("error");
    } finally {
      clearTimeout(timeout);
      if (current === sequence.current) request.current = null;
    }
  }

  const statusIcon =
    result?.verdict === "spoof"
      ? ShieldAlert
      : result?.verdict === "genuine"
        ? ShieldCheck
        : CircleAlert;
  const StatusIcon = statusIcon;
  const showPreviewNotice =
    connection === "ready" &&
    health &&
    (!health.model_loaded || result?.metadata.provider === "fallback");

  return (
    <section
      id="simulasi"
      className="simulation-section section-space"
      aria-labelledby="simulation-title"
    >
      <div className="container">
        <Reveal className="section-heading">
          <div>
            <p className="eyebrow">SIMULASI PEMERIKSAAN</p>
            <h2 id="simulation-title">
              Coba pemeriksaan
              <br />
              <span>wajah.</span>
            </h2>
          </div>
          <p className="heading-aside">
            Pilih salah satu gambar contoh, lalu lihat ringkasan pemeriksaannya
            dalam satu alur.
          </p>
        </Reveal>
        <div className="simulation-service" aria-live="polite">
          {connection === "connecting" ? (
            <span className="service-connecting">
              <LoaderCircle size={15} className="spinner" />
              Menghubungkan layanan pemeriksaan…
            </span>
          ) : connection === "offline" ? (
            <div className="simulation-offline">
              <WifiOff size={17} />
              <span>Layanan pemeriksaan belum dapat dihubungi.</span>
              <button onClick={() => setConnectAttempt((value) => value + 1)}>
                Coba hubungkan
                <RotateCcw size={13} />
              </button>
            </div>
          ) : (
            <span className="service-online">
              <i />
              Layanan pemeriksaan terhubung
            </span>
          )}
        </div>
        {showPreviewNotice && (
          <div className="simulation-notice" role="note">
            <Info size={18} />
            <p>
              <strong>
                {health.model_loaded
                  ? "Hasil ditampilkan sebagai pratinjau."
                  : "Model belum dimuat."}
              </strong>{" "}
              Gunakan contoh internal untuk mencoba alur pemeriksaan. Hasil
              pratinjau mengacu pada contoh yang dipilih.
            </p>
          </div>
        )}
        <Reveal className="simulation-workspace">
          <div className="simulation-input">
            <div className="workspace-label">
              <span>
                <span className="step-index">01</span>Pilih gambar contoh
              </span>
              <span>6 contoh tersedia</span>
            </div>
            <div
              className={`simulation-preview${phase === "running" ? " is-scanning" : ""}`}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.img
                  key={example.id}
                  src={image(example.image_name)}
                  width={example.width}
                  height={example.height}
                  alt={`Gambar pemeriksaan: ${example.title}`}
                  loading="lazy"
                  initial={{ opacity: 0, scale: reduced ? 1 : 1.025 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reduced ? 0 : 0.18 }}
                />
              </AnimatePresence>
              <span className="preview-corner corner-tl" />
              <span className="preview-corner corner-tr" />
              <span className="preview-corner corner-bl" />
              <span className="preview-corner corner-br" />
              {phase === "running" && (
                <div className="scan-line" aria-hidden="true" />
              )}
              <span className="simulation-image-caption">
                <ScanFace size={14} />
                {example.title}
              </span>
            </div>
            <div
              className="simulation-examples"
              aria-label="Gambar contoh pemeriksaan"
            >
              {examples.map((item) => (
                <button
                  key={item.id}
                  className={item.id === selected ? "is-selected" : ""}
                  aria-pressed={item.id === selected}
                  aria-label={`Pilih contoh ${item.title}`}
                  onClick={() => chooseExample(item.id)}
                >
                  <span>
                    <img
                      src={image(item.image_name)}
                      width={item.width}
                      height={item.height}
                      loading="lazy"
                      alt=""
                    />
                    {item.id === selected && (
                      <i>
                        <Check size={11} />
                      </i>
                    )}
                  </span>
                  <strong>{item.title}</strong>
                </button>
              ))}
            </div>
            <div className="simulation-actions">
              <button
                className="button button-primary"
                onClick={analyze}
                disabled={phase === "running" || connection !== "ready"}
              >
                {phase === "running" ? (
                  <>
                    <LoaderCircle className="spinner" size={17} />
                    Memeriksa gambar…
                  </>
                ) : (
                  <>
                    Periksa gambar
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
              <button
                className="simulation-reset"
                onClick={() => chooseExample("realperson")}
              >
                <RotateCcw size={15} />
                Atur ulang
              </button>
            </div>
            <p className="simulation-input-note">
              Gunakan gambar contoh yang tersedia untuk menjelajahi alur
              pemeriksaan.
            </p>
          </div>
          <div
            className="simulation-output"
            aria-live="polite"
            aria-busy={phase === "running"}
          >
            <div className="workspace-label">
              <span>
                <span className="step-index">02</span>Ringkasan pemeriksaan
              </span>
              {phase === "complete" && (
                <span className="output-complete">
                  <CheckCheck size={14} />
                  Selesai
                </span>
              )}
            </div>
            <AnimatePresence mode="wait" initial={false}>
              {phase === "running" ? (
                <motion.div
                  key="running"
                  className="simulation-running"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="running-symbol">
                    <ScanFace size={35} />
                    <span />
                  </div>
                  <h3>Menyiapkan hasil pemeriksaan</h3>
                  <p>Gambar pilihan Anda sedang diproses.</p>
                  <div className="running-steps">
                    <span>
                      <Check size={14} />
                      Gambar diterima
                    </span>
                    <span>
                      <LoaderCircle size={14} className="spinner" />
                      Pemeriksaan berlangsung
                    </span>
                    <span>
                      <ChevronRight size={14} />
                      Ringkasan hasil
                    </span>
                  </div>
                </motion.div>
              ) : phase === "error" ? (
                <motion.div
                  key="error"
                  className="simulation-error"
                  role="alert"
                  initial={{ opacity: 0, y: 7 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <CircleAlert size={35} />
                  <h3>Pemeriksaan belum selesai</h3>
                  <p>{error}</p>
                  <button className="button button-outline" onClick={analyze}>
                    Coba lagi
                    <RotateCcw size={15} />
                  </button>
                </motion.div>
              ) : result ? (
                <motion.div
                  key={result.request_id}
                  className={`analysis-result verdict-${result.verdict}`}
                  data-testid="analysis-result"
                  initial={{ opacity: 0, y: reduced ? 0 : 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reduced ? 0 : 0.35, ease }}
                >
                  <span className="result-symbol">
                    <StatusIcon size={30} strokeWidth={1.6} />
                  </span>
                  <span className="result-kind">
                    {result.metadata.provider === "fallback"
                      ? "PRATINJAU HASIL"
                      : "HASIL PEMERIKSAAN"}
                  </span>
                  <h3>{result.title}</h3>
                  <div className="result-class">
                    <span>Jenis tampilan</span>
                    <strong>{result.class_name}</strong>
                  </div>
                  <p className="result-summary">{result.summary}</p>
                  {result.confidence !== null && (
                    <div className="result-confidence">
                      <span>Keyakinan pemeriksaan</span>
                      <strong>{Math.round(result.confidence * 100)}%</strong>
                    </div>
                  )}
                  <div className="result-observations">
                    <h4>Hal yang perlu diperhatikan</h4>
                    <ul>
                      {result.observations.map((item) => (
                        <li key={item}>
                          <Check size={14} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="result-footer">
                    <span>
                      {result.image.width} × {result.image.height} px
                    </span>
                    <span>#{result.request_id.slice(0, 8)}</span>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  className="simulation-empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <span className="empty-scan-icon">
                    <ScanFace size={34} strokeWidth={1.5} />
                  </span>
                  <h3>Hasil akan tampil di sini.</h3>
                  <p>
                    Pilih gambar contoh dan tekan{" "}
                    <strong>Periksa gambar</strong> untuk memulai.
                  </p>
                  <ol>
                    <li>
                      <span>1</span>Pilih gambar
                    </li>
                    <li>
                      <span>2</span>Jalankan pemeriksaan
                    </li>
                    <li>
                      <span>3</span>Lihat ringkasan
                    </li>
                  </ol>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
