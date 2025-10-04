"use client";

import { useMemo, useRef, useState } from "react";
import type { ChangeEvent, DragEvent, InputHTMLAttributes } from "react";
import { useAuth } from "@/auth/AuthProvider";
import { useContractsList } from "@/hooks/useProcurement";
import type { ContractRow, Risk, Status } from "@/types/procurement";
import { uploadContractFile } from "@/lib/uploadContractFile";
import { uploadAndAnalyzeContract } from "@/services/riskAnalysisService";
import supabase from "@/utils/supabase";

const CONTRACT_TYPES = [
  "Goods Procurement",
  "Services",
  "Maintenance",
  "Consulting",
  "Software License",
];

const STATUS_BADGE: Partial<Record<Status, string>> = {
  Submitted: "bg-gray-100 text-gray-600 border border-gray-300",
  Reviewed: "bg-orange-100 text-orange-700 border border-orange-200",
  Approved: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  "Revision Requested": "bg-rose-100 text-rose-700 border border-rose-200",
  Draft: "bg-slate-100 text-slate-600 border border-slate-200",
  Active: "bg-blue-100 text-blue-700 border border-blue-200",
  Expired: "bg-slate-200 text-slate-600 border border-slate-300",
  Rejected: "bg-rose-100 text-rose-700 border border-rose-200",
};

const RISK_BADGE: Partial<Record<Risk, string>> = {
  Low: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  Medium: "bg-amber-100 text-amber-700 border border-amber-200",
  High: "bg-rose-100 text-rose-700 border border-rose-200",
};

const numberFormatter = new Intl.NumberFormat("id-ID");

export default function UploadContract() {
  const { session } = useAuth();
  const { rows } = useContractsList();
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [extractingDetails, setExtractingDetails] = useState(false);
  const [meta, setMeta] = useState({ name: "", type: "", value_rp: 0 });
  const [valueInput, setValueInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const latestContracts = useMemo(() => rows.slice(0, 3), [rows]);

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
    setDragging(false);
    const incoming = event.dataTransfer.files?.[0];
    if (incoming) setFile(incoming);
  }

  function handleBrowseChange(event: ChangeEvent<HTMLInputElement>) {
    const incoming = event.target.files?.[0];
    if (incoming) setFile(incoming);
  }

  function handleValueChange(event: ChangeEvent<HTMLInputElement>) {
    const digits = event.target.value.replace(/[^0-9]/g, "");
    setValueInput(digits ? numberFormatter.format(Number(digits)) : "");
    setMeta((prev) => ({ ...prev, value_rp: digits ? Number(digits) : 0 }));
  }

  async function handleSaveDraft() {
    if (uploading) return;

    setUploading(true);
    try {
      const { data, error } = await supabase
        .from("contracts")
        .insert([
          {
            name: meta.name,
            second_party: null,
            value_rp: meta.value_rp || null,
            status: "Draft",
            created_by: session?.user?.id ?? null,
          },
        ])
        .select("id")
        .single();

      if (error) {
        alert(error.message);
        return;
      }

      await maybeUpload(data.id as string);
      alert("Draft disimpan");
    } catch (error) {
      console.error("Error saving draft:", error);
      alert("Gagal menyimpan draft");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmitToLegal() {
    if (uploading) return;

    setUploading(true);
    try {
      const { data, error } = await supabase
        .from("contracts")
        .insert([
          {
            name: meta.name,
            value_rp: meta.value_rp || null,
            status: "Submitted",
            created_by: session?.user?.id ?? null,
          },
        ])
        .select("id")
        .single();

      if (error) {
        alert(error.message);
        return;
      }

      await maybeUploadAndAnalyze(data.id as string);
      alert("Kontrak dikirim ke Legal dan sedang dianalisis AI");
    } catch (error) {
      console.error("Error submitting to legal:", error);
      alert("Gagal mengirim kontrak");
    } finally {
      setUploading(false);
    }
  }

  async function maybeUpload(contractId: string) {
    if (!file) return;
    try {
      const { file_url } = await uploadContractFile(contractId, file);
      await supabase
        .from("contracts")
        .update({ file_url })
        .eq("id", contractId);
    } catch (error) {
      console.error(error);
      alert("Gagal mengunggah file");
    }
  }

  async function maybeUploadAndAnalyze(contractId: string) {
    if (!file) return;

    setExtractingDetails(true);
    setAnalyzing(true);
    try {
      const result = await uploadAndAnalyzeContract(contractId, file);

      // Handle contract details extraction
      const detailsSuccess = result?.contract_details?.success === true;
      const detailsError = result?.errors?.contract_details_error;
      
      if (detailsSuccess && result?.contract_details) {
        console.log("Contract details extracted:", result.contract_details);
      } else {
        console.warn("Contract details extraction failed:", detailsError);
      }

      // Handle AI analysis
      const analysisSuccess = result?.analysis !== null;
      const analysisError = result?.errors?.analysis_error;
      
      if (analysisSuccess && result?.analysis) {
        console.log("AI Analysis completed:", result.analysis);
      } else {
        console.warn("AI Analysis failed:", analysisError);
      }

      // Show success message with details
      const detailsMsg = detailsSuccess 
        ? "✅ Detail kontrak berhasil diekstrak" 
        : `⚠️ Ekstraksi detail gagal${detailsError ? ': ' + (detailsError as Error).message : ''}`;
      const analysisMsg = analysisSuccess 
        ? "✅ Analisis AI selesai" 
        : `⚠️ Analisis AI gagal${analysisError ? ': ' + (analysisError as Error).message : ''}`;
      
      alert(`Kontrak berhasil diproses:\n${detailsMsg}\n${analysisMsg}`);
      
    } catch (error) {
      console.error("Error in upload and analyze:", error);
      alert("Gagal mengunggah file atau memproses kontrak");
    } finally {
      setExtractingDetails(false);
      setAnalyzing(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <header className="space-y-1">
              <h1 className="text-2xl font-semibold text-slate-900">
                Upload Contract
              </h1>
              <p className="text-sm text-slate-500">
                Unggah dokumen kontrak baru untuk dianalisis oleh sistem AI.
              </p>
            </header>

            <div
              onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`mt-6 flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed px-6 py-12 text-center transition ${
                dragging
                  ? "border-[#357ABD] bg-[#357ABD]/5"
                  : "border-slate-300 bg-slate-50"
              }`}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
                <svg
                  aria-hidden
                  className="h-6 w-6 text-slate-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 12v6" />
                  <path d="M16 16H8" />
                  <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 4 16.3" />
                </svg>
              </div>
              <p className="mt-4 text-sm font-semibold text-slate-700">
                Tarik dan letakkan file kontrak di sini
              </p>
              <p className="text-xs text-slate-500">
                atau klik untuk unggah file (PDF, DOCX, TXT)
              </p>
              <button
                type="button"
                className="mt-6 inline-flex items-center rounded-full bg-[#357ABD] px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2e6dad]"
              >
                Pilih File
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                className="hidden"
                onChange={handleBrowseChange}
              />
              {file && (
                <div className="mt-3 text-xs text-slate-500">
                  File terpilih: {file.name}
                </div>
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <header className="space-y-1">
              <h2 className="text-lg font-semibold text-slate-900">
                Informasi Kontrak (Opsional)
              </h2>
              <p className="text-sm text-slate-500">
                Lengkapi detail singkat untuk membantu tim legal melakukan
                identifikasi.
              </p>
            </header>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Field label="Nama Kontrak">
                <Input
                  placeholder="Masukkan nama kontrak"
                  value={meta.name}
                  onChange={(event) =>
                    setMeta((prev) => ({ ...prev, name: event.target.value }))
                  }
                />
              </Field>
              <Field label="Jenis Kontrak">
                <select
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none transition focus:border-[#357ABD] focus:ring-2 focus:ring-[#357ABD]/20"
                  value={meta.type}
                  onChange={(event) =>
                    setMeta((prev) => ({ ...prev, type: event.target.value }))
                  }
                >
                  <option value="">Pilih jenis kontrak</option>
                  {CONTRACT_TYPES.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Nilai Kontrak (Rp)" className="md:col-span-2">
                <div className="flex items-center rounded-xl border border-slate-300 bg-white shadow-sm transition focus-within:border-[#357ABD] focus-within:ring-2 focus-within:ring-[#357ABD]/20">
                  <span className="border-r border-slate-200 px-3 py-2 text-sm font-medium text-slate-500">
                    IDR
                  </span>
                  <input
                    className="flex-1 border-0 bg-transparent px-3 py-2 text-sm text-slate-700 outline-none"
                    placeholder="Masukkan nilai kontrak (opsional)"
                    inputMode="numeric"
                    value={valueInput}
                    onChange={handleValueChange}
                  />
                </div>
              </Field>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                disabled={uploading || analyzing || extractingDetails || !file}
                className="inline-flex items-center rounded-xl bg-[#357ABD] px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2e6dad] disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleSubmitToLegal}
              >
                {uploading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Uploading...
                  </>
                ) : analyzing ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    AI Analyzing...
                  </>
                ) : (
                  "Submit to Legal"
                )}
              </button>
              <button
                type="button"
                disabled={uploading || analyzing || extractingDetails}
                className="inline-flex items-center rounded-xl border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleSaveDraft}
              >
                {uploading ? "Saving..." : "Save Draft"}
              </button>
            </div>

            {/* Status indicators */}
            {(uploading || analyzing || extractingDetails) && (
              <div className="mt-4 rounded-xl bg-blue-50 border border-blue-200 p-4">
                <div className="flex items-center">
                  <svg
                    className="animate-spin h-5 w-5 text-blue-600 mr-3"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <div className="text-sm text-blue-800">
                    {uploading && "Mengunggah file ke storage..."}
                    {extractingDetails && "Mengekstrak detail kontrak..."}
                    {analyzing && "AI sedang menganalisis risiko kontrak..."}
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-800">
              Status Kontrak Terbaru
            </h3>
            <div className="mt-4 space-y-4">
              {latestContracts.length === 0 && (
                <p className="text-xs text-slate-500">
                  Belum ada kontrak terbaru.
                </p>
              )}
              {latestContracts.map((contract, index) => (
                <LatestStatusCard
                  key={contract.id}
                  contract={contract}
                  highlight={index === 0}
                />
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-800">
              Tips Upload
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                File maksimal 10MB
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                Format: PDF, DOCX, TXT
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                Pastikan teks dapat dibaca
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                Hindari scan berkualitas rendah
              </li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`space-y-1 text-sm ${className ?? ""}`}>
      <span className="block font-medium text-slate-600">{label}</span>
      {children}
    </label>
  );
}

function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  const { className, ...rest } = props;
  return (
    <input
      {...rest}
      className={`w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none transition focus:border-[#357ABD] focus:ring-2 focus:ring-[#357ABD]/20 ${
        className ?? ""
      }`}
    />
  );
}

function LatestStatusCard({
  contract,
  highlight,
}: {
  contract: ContractRow;
  highlight: boolean;
}) {
  const badgeClass =
    STATUS_BADGE[contract.status] ??
    "bg-slate-100 text-slate-600 border border-slate-200";
  const riskClass = contract.risk
    ? RISK_BADGE[contract.risk] ??
      "bg-slate-100 text-slate-600 border border-slate-200"
    : null;

  return (
    <div
      className={`space-y-3 rounded-2xl border px-4 py-4 ${
        highlight
          ? "border-[#357ABD]/40 bg-[#357ABD]/5"
          : "border-slate-200 bg-slate-50"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="text-sm font-semibold text-slate-800">
            {contract.name || "Untitled Contract"}
          </div>
          <div className="text-xs text-slate-500">
            {statusMessage(contract.status)}
          </div>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${badgeClass}`}
        >
          {formatStatusLabel(contract.status)}
        </span>
      </div>
      {highlight && (
        <div>
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Sedang dianalisis AI Legal</span>
            <span>65%</span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/60">
            <div className="h-full w-2/3 rounded-full bg-[#357ABD]" />
          </div>
        </div>
      )}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <span>
          Diperbarui{" "}
          {formatRelativeTime(contract.updated_at ?? contract.created_at)}
        </span>
        {riskClass && (
          <span
            className={`inline-flex items-center rounded-full px-2 py-1 text-[10px] font-semibold ${riskClass}`}
          >
            {contract.risk}
          </span>
        )}
      </div>
    </div>
  );
}

function statusMessage(status: Status): string {
  switch (status) {
    case "Submitted":
      return "Sedang dianalisis AI Legal";
    case "Reviewed":
      return "Review selesai - menunggu approval";
    case "Approved":
      return "Analisis selesai - siap ditandatangani";
    case "Revision Requested":
      return "Menunggu revisi dari tim Legal";
    case "Draft":
      return "Draft tersimpan - siap dilanjutkan";
    case "Active":
      return "Kontrak aktif dan berjalan";
    case "Expired":
      return "Kontrak telah berakhir";
    case "Rejected":
      return "Kontrak ditolak";
    default:
      return "Status proses kontrak";
  }
}

function formatStatusLabel(status: Status): string {
  switch (status) {
    case "Submitted":
      return "Submitted";
    case "Reviewed":
      return "Reviewed";
    case "Approved":
      return "Approved";
    case "Revision Requested":
      return "Revision Requested";
    case "Draft":
      return "Draft";
    case "Rejected":
      return "Rejected";
    case "Active":
      return "Active";
    case "Expired":
      return "Expired";
    default:
      return String(status).replace(/_/g, " ");
  }
}

function formatRelativeTime(isoDate: string): string {
  if (!isoDate) return "N/A";
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "N/A";
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  if (diffMinutes < 1) return "Baru saja";
  if (diffMinutes < 60) return `${diffMinutes} menit lalu`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} jam lalu`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} hari lalu`;
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 5) return `${diffWeeks} minggu lalu`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths} bulan lalu`;
  const diffYears = Math.floor(diffDays / 365);
  return `${diffYears} tahun lalu`;
}
