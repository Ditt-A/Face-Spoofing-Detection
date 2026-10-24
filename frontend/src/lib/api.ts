export type ClassLabel =
  | "realperson"
  | "fake_printed"
  | "fake_screen"
  | "fake_mask"
  | "fake_mannequin"
  | "fake_unknown";
export type ApiHealth = {
  status: "ok";
  provider: "fallback" | "model";
  model_loaded: boolean;
  model_load_enabled: boolean;
  model_state: "disabled" | "not_configured" | "load_failed" | "ready";
};
export type Example = {
  id: ClassLabel;
  title: string;
  image_name: string;
  width: number;
  height: number;
  summary: string;
  observations: string[];
};
export type AnalysisResult = {
  request_id: string;
  created_at: string;
  status: "completed";
  verdict: "genuine" | "spoof" | "review";
  label: ClassLabel | null;
  class_name: string;
  title: string;
  summary: string;
  observations: string[];
  confidence: number | null;
  image: {
    example_id: ClassLabel;
    title: string;
    image_name: string;
    width: number;
    height: number;
    size_bytes: number;
  };
  metadata: {
    provider: "fallback" | "model";
    model_loaded: boolean;
    fallback_reason: string | null;
    result_source: "reference_example" | "model_prediction";
  };
  elapsed_ms: number;
};

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(
      `${import.meta.env.BASE_URL}api/v1/${path}`,
      options,
    );
  } catch (error) {
    if (options.signal?.aborted) throw error;
    throw new Error(
      "Layanan pemeriksaan belum dapat dihubungi. Silakan coba kembali.",
    );
  }
  if (!response.ok) {
    if (response.status === 422)
      throw new Error(
        "Pilihan gambar tidak dikenali. Pilih kembali contoh yang tersedia.",
      );
    throw new Error(
      "Layanan pemeriksaan belum dapat dihubungi. Silakan coba kembali.",
    );
  }
  try {
    return (await response.json()) as T;
  } catch {
    throw new Error(
      "Hasil pemeriksaan belum dapat ditampilkan. Silakan coba kembali.",
    );
  }
}
