import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppData } from "../../context/AppDataContext";
import { useToast } from "../../context/ToastContext";
import { TopBar, Screen, BottomNav, Fab } from "../../components/ui/AppShell";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { Dialog } from "../../components/ui/Dialog";
import { Button } from "../../components/ui/Button";
import type { FarmField } from "../../types";

function MapPinIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function EditIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function TrashIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

function RulerIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z" />
      <path d="m14.5 12.5 2-2" />
      <path d="m11.5 9.5 2-2" />
      <path d="m8.5 6.5 2-2" />
      <path d="m17.5 15.5 2-2" />
    </svg>
  );
}

const OWNERSHIP_LABELS: Record<string, string> = {
  owned: "પોતાની",
  leased: "ભાડા પર",
  shared: "ભાગ-ભૂમિ",
};

function FieldCard({ field, onEdit, onDelete }: { field: FarmField; onEdit: () => void; onDelete: () => void }) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-full bg-[var(--color-crop-50)] flex items-center justify-center text-[var(--color-crop-500)] shrink-0 mt-0.5">
            <MapPinIcon size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-[15.5px] font-semibold text-[var(--color-ink)] truncate">{field.name}</p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
              {field.areaLabel && (
                <span className="flex items-center gap-1 text-[13px] text-[var(--color-ink-soft)]">
                  <RulerIcon size={13} />
                  {field.areaLabel}
                </span>
              )}
              {field.areaBigha && (
                <span className="text-[13px] text-[var(--color-ink-soft)]">{field.areaBigha} વિઘા</span>
              )}
              {field.ownershipType && (
                <span className="text-[12px] px-2 py-0.5 rounded-full bg-[var(--color-paper-dim)] text-[var(--color-ink-faint)] font-medium">
                  {OWNERSHIP_LABELS[field.ownershipType] ?? field.ownershipType}
                </span>
              )}
            </div>
            {field.notes && (
              <p className="text-[12.5px] text-[var(--color-ink-faint)] mt-1 leading-snug line-clamp-2">{field.notes}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onEdit}
            className="w-9 h-9 flex items-center justify-center rounded-full text-[var(--color-ink-soft)] active:bg-[var(--color-paper-dim)] transition-colors"
            aria-label="ખેતર એડિટ કરો"
          >
            <EditIcon size={17} />
          </button>
          <button
            onClick={onDelete}
            className="w-9 h-9 flex items-center justify-center rounded-full text-[var(--color-loss-500)] active:bg-red-50 transition-colors"
            aria-label="ખેતર ડિલીટ કરો"
          >
            <TrashIcon size={17} />
          </button>
        </div>
      </div>
    </Card>
  );
}

export default function FieldsTab() {
  const navigate = useNavigate();
  const { fields, deleteField } = useAppData();
  const { show } = useToast();
  const [deleteTarget, setDeleteTarget] = useState<FarmField | null>(null);

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteField(deleteTarget.id);
    show("ખેતર ડિલીટ થઈ");
    setDeleteTarget(null);
  };

  return (
    <>
      <TopBar title="મારા ખેતર" onBack={() => navigate("/")} />
      <Screen>
        {fields.length === 0 ? (
          <EmptyState
            icon={<MapPinIcon size={30} />}
            title="હજુ કોઈ ખેતર ઉમેર્યું નથી"
            description="+ બટન દ્વારા ખેતર ઉમેરો. નવી ખેતી બનાવતી વખતે સ્વત: ભરાઈ જશે."
            action={
              <button
                onClick={() => navigate("/fields/new")}
                className="text-[14px] font-semibold text-[var(--color-crop-500)]"
              >
                ખેતર ઉમેરો →
              </button>
            }
          />
        ) : (
          <div className="space-y-3">
            {fields.map((f) => (
              <FieldCard
                key={f.id}
                field={f}
                onEdit={() => navigate(`/fields/${f.id}/edit`)}
                onDelete={() => setDeleteTarget(f)}
              />
            ))}
          </div>
        )}
      </Screen>
      <Fab onClick={() => navigate("/fields/new")} />
      <BottomNav />

      <Dialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="ખેતર ડિલીટ કરવું?"
        footer={
          <>
            <Button variant="outline" fullWidth onClick={() => setDeleteTarget(null)}>
              રદ કરો
            </Button>
            <Button variant="danger" fullWidth onClick={handleDelete}>
              ડિલીટ કરો
            </Button>
          </>
        }
      >
        <p className="text-[14px] text-[var(--color-ink-soft)]">
          <strong>{deleteTarget?.name}</strong> ખેતર ડિલીટ થઈ જશે. આ ક્રિયા પૂર્વવત્ ન થઈ શકે.
        </p>
      </Dialog>
    </>
  );
}
