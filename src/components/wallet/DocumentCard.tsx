
import type { UserDocument } from "../../types";
import { TrashIcon, DownloadIcon } from "../icons/UIIcons";
import { FileTextIcon } from "../icons/ModuleIcons";

function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

function formatDate(ms: number) {
  const d = new Date(ms);
  return d.toLocaleDateString("gu-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function DocumentCard({
  doc,
  onDelete,
}: {
  doc: UserDocument;
  onDelete: (id: string) => void;
}) {
  const isImage = doc.fileType.startsWith("image/");
  const isPdf = doc.fileType === "application/pdf";

  /** Trigger a native download from the Base64 data URL. */
  const handleDownload = () => {
    const ext = doc.fileType.split("/").pop() ?? "bin";
    const a = document.createElement("a");
    a.href = doc.base64Data;
    a.download = `${doc.name}.${ext}`;
    a.click();
  };

  /** Open the document in a new tab (works for images and PDFs). */
  const handlePreview = () => {
    const newTab = window.open();
    if (!newTab) return;
    if (isImage) {
      newTab.document.write(
        `<html><body style="margin:0;background:#000;display:flex;justify-content:center;align-items:center;min-height:100vh">` +
          `<img src="${doc.base64Data}" alt="${doc.name}" style="max-width:100%;max-height:100vh;object-fit:contain" /></body></html>`
      );
    } else {
      // For PDF: embed the base64 data URL directly
      newTab.document.write(
        `<html><body style="margin:0"><embed width="100%" height="100%" src="${doc.base64Data}" type="application/pdf" /></body></html>`
      );
    }
    newTab.document.close();
  };

  return (
    <div className="flex flex-col bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-card)] p-4 shadow-sm">
      <div className="flex items-start gap-3">
        {/* Thumbnail / Icon */}
        <button
          onClick={handlePreview}
          className="w-12 h-12 rounded-[var(--radius-control)] bg-[var(--color-paper-dim)] flex items-center justify-center text-[var(--color-ink-faint)] shrink-0 overflow-hidden active:scale-95 transition-transform"
          title="પ્રીવ્યૂ"
        >
          {isImage ? (
            <img
              src={doc.base64Data}
              alt={doc.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <FileTextIcon size={24} />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <h3 className="text-[15px] font-semibold text-[var(--color-ink)] truncate leading-tight">
            {doc.name}
          </h3>
          <p className="text-[12px] text-[var(--color-crop-500)] font-medium mt-1">
            {doc.category}
          </p>
          <p className="text-[11.5px] text-[var(--color-ink-faint)] mt-0.5">
            {formatDate(doc.createdAt)} • {formatBytes(doc.size)} •{" "}
            {isPdf ? "PDF" : doc.fileType.split("/")[1]?.toUpperCase() ?? doc.fileType}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-[var(--color-border)]">
        {/* Preview */}
        <button
          onClick={handlePreview}
          className="flex items-center gap-1.5 h-8 px-3 rounded-full bg-[var(--color-paper-dim)] text-[var(--color-ink-soft)] text-[12px] font-semibold active:scale-95 transition-transform"
        >
          <span>👁</span>
          જુઓ
        </button>

        {/* Download */}
        <button
          onClick={handleDownload}
          className="flex items-center gap-1.5 h-8 px-3 rounded-full bg-[var(--color-crop-50)] text-[var(--color-crop-600)] text-[12px] font-semibold active:scale-95 transition-transform"
        >
          <DownloadIcon size={16} />
          ડાઉનલોડ
        </button>

        {/* Delete */}
        <button
          onClick={() => {
            if (window.confirm("શું તમે ખરેખર આ દસ્તાવેજ કાઢી નાખવા માંગો છો?")) {
              onDelete(doc.id);
            }
          }}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--color-loss-100)] text-[var(--color-loss-500)] active:scale-95 transition-transform shrink-0"
          aria-label="કાઢી નાખો"
        >
          <TrashIcon size={16} />
        </button>
      </div>
    </div>

  );
}
