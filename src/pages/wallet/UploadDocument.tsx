import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";
import { Screen, TopBar } from "../../components/ui/AppShell";
import { UploadIcon } from "../../components/icons/UIIcons";
import { FileTextIcon } from "../../components/icons/ModuleIcons";
import { db, auth } from "../../firebase";
import type { DocumentCategory } from "../../types";
import { makeId } from "../../lib/id";

const CATEGORIES: DocumentCategory[] = [
  "Aadhaar",
  "PAN",
  "Land Records",
  "Soil Health Card",
  "Crop Insurance",
  "Farmer ID",
  "Loan Documents",
  "Purchase Bills",
  "Sale Receipts",
  "Other",
];

const MAX_FILE_SIZE = 500 * 1024; // 500 KB

/** Reads a File and returns a Base64 data URL string. */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export default function UploadDocument() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<DocumentCategory>("Aadhaar");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      if (f.size > MAX_FILE_SIZE) {
        alert("ફાઇલ 500 KB થી નાની હોવી જોઈએ.");
        return;
      }
      setFile(f);
      if (!name) setName(f.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("કૃપા કરીને ફાઇલ પસંદ કરો.");
      return;
    }
    if (!name.trim()) {
      alert("કૃપા કરીને દસ્તાવેજનું નામ લખો.");
      return;
    }
    const user = auth.currentUser;
    if (!user) return;

    setUploading(true);
    try {
      // Convert file to Base64 data URL — no Firebase Storage needed
      const base64Data = await fileToBase64(file);
      const docId = makeId();

      await setDoc(doc(db, "users", user.uid, "documents", docId), {
        id: docId,
        uid: user.uid,
        name: name.trim(),
        category,
        size: file.size,
        fileType: file.type,
        base64Data,           // stored directly in Firestore
        createdAt: Date.now(),
      });

      navigate(-1);
    } catch (e) {
      console.error("Upload failed", e);
      alert("દસ્તાવેજ સેવ કરવામાં ભૂલ થઈ. કૃપા કરીને ફરી પ્રયાસ કરો.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <TopBar title="નવો દસ્તાવેજ" />
      <Screen withNav={false}>
        <div className="space-y-5 mt-2">
          {/* File Picker */}
          <div>
            <label className="block text-[14px] font-medium text-[var(--color-ink)] mb-2">
              દસ્તાવેજની ફાઇલ
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-[var(--radius-card)] p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
                file
                  ? "border-[var(--color-crop-400)] bg-[var(--color-crop-50)]"
                  : "border-[var(--color-border)] bg-[var(--color-surface)]"
              }`}
            >
              {file ? (
                <>
                  <FileTextIcon size={32} className="text-[var(--color-crop-500)] mb-2" />
                  <p className="text-[14px] font-semibold text-[var(--color-crop-600)]">{file.name}</p>
                  <p className="text-[12px] text-[var(--color-crop-500)] mt-1">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </>
              ) : (
                <>
                  <UploadIcon size={32} className="text-[var(--color-ink-faint)] mb-2" />
                  <p className="text-[14px] font-semibold text-[var(--color-ink)]">
                    અહીં ક્લિક કરીને ફાઇલ પસંદ કરો
                  </p>
                  <p className="text-[12px] text-[var(--color-ink-faint)] mt-1">
                    PDF, JPG, PNG (Max 500 KB)
                  </p>
                </>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              accept=".pdf,image/jpeg,image/png,image/jpg"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Name Input */}
          <div>
            <label className="block text-[14px] font-medium text-[var(--color-ink)] mb-2">
              દસ્તાવેજનું નામ
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="દા.ત. મારું આધાર કાર્ડ"
              className="w-full h-12 px-4 rounded-[var(--radius-control)] bg-[var(--color-surface)] border border-[var(--color-border)] text-[15px] outline-none focus:border-[var(--color-crop-400)] transition-colors placeholder:text-[var(--color-ink-faint)]"
            />
          </div>

          {/* Category Select */}
          <div>
            <label className="block text-[14px] font-medium text-[var(--color-ink)] mb-2">
              પ્રકાર
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as DocumentCategory)}
              className="w-full h-12 px-4 rounded-[var(--radius-control)] bg-[var(--color-surface)] border border-[var(--color-border)] text-[15px] outline-none focus:border-[var(--color-crop-400)] transition-colors appearance-none"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-4">
            <button
              onClick={handleUpload}
              disabled={uploading || !file || !name.trim()}
              className="w-full h-14 rounded-[var(--radius-control)] bg-[var(--color-crop-500)] text-white font-semibold text-[15px] active:scale-[0.98] transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>સેવ થઈ રહ્યું છે...</span>
                </>
              ) : (
                <>
                  <UploadIcon size={20} />
                  <span>દસ્તાવેજ સેવ કરો</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Screen>
    </>
  );
}
