import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppData } from "../../context/AppDataContext";
import { TopBar, Screen } from "../../components/ui/AppShell";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Dialog } from "../../components/ui/Dialog";
import { EmptyState } from "../../components/ui/EmptyState";
import { PlusIcon, TrashIcon } from "../../components/icons/UIIcons";
import { CategoryIcon } from "../../components/icons/CategoryIcons";
import { formatCurrency, formatDateDMY } from "../../lib/format";
import { EXPENSE_CATEGORIES, type InventoryItem } from "../../types";
import { useToast } from "../../context/ToastContext";

export default function InventoryTab() {
  const navigate = useNavigate();
  const { inventoryItems, expenses, deleteInventoryItem } = useAppData();
  const { show } = useToast();
  
  const [deleteConfirm, setDeleteConfirm] = useState<InventoryItem | null>(null);

  const getRemaining = (item: InventoryItem) => {
    const used = expenses
      .filter((e) => e.inventoryItemId === item.id)
      .reduce((sum, e) => sum + (e.inventoryQuantityUsed || 0), 0);
    return item.totalQuantity - used;
  };

  const handleDelete = () => {
    if (deleteConfirm) {
      deleteInventoryItem(deleteConfirm.id);
      show("સ્ટોક કાઢી નાખવામાં આવ્યો");
      setDeleteConfirm(null);
    }
  };

  return (
    <>
      <TopBar
        title="સ્ટોક ગોડાઉન"
        onBack={() => navigate(-1)}
      />
      <Screen withNav={false}>
        <div className="mb-4">
          <Button fullWidth size="lg" onClick={() => navigate("/inventory/new")}>
            <PlusIcon size={18} /> નવો સ્ટોક ઉમેરો
          </Button>
        </div>

        {inventoryItems.length === 0 ? (
          <EmptyState
            icon={<CategoryIcon category="fertilizer" size={24} />}
            title="કોઈ સ્ટોક નથી"
            description="ખાતર, દવા કે બીજનો જથ્થાબંધ સ્ટોક ઉમેરો અને તેને અલગ-અલગ ખેતરમાં વાપરો."
          />
        ) : (
          <div className="space-y-3">
            {inventoryItems.sort((a, b) => b.createdAt - a.createdAt).map((item) => {
              const remaining = getRemaining(item);
              const isLow = remaining <= 0;
              const catLabel = EXPENSE_CATEGORIES.find(c => c.id === item.category)?.label || "અન્ય";
              
              return (
                <Card key={item.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <span className="w-10 h-10 rounded-full bg-[var(--color-crop-50)] text-[var(--color-crop-500)] flex items-center justify-center shrink-0">
                      <CategoryIcon category={item.category} size={20} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[16px] font-bold text-[var(--color-ink)] truncate">{item.name}</h3>
                      <p className="text-[12.5px] text-[var(--color-ink-faint)] mt-0.5">
                        {catLabel} · {formatDateDMY(item.datePurchased)}
                      </p>
                    </div>
                    <button 
                      onClick={() => setDeleteConfirm(item)}
                      className="w-8 h-8 flex items-center justify-center text-[var(--color-loss-500)] bg-[var(--color-loss-50)] rounded-full active:bg-[var(--color-loss-100)]"
                    >
                      <TrashIcon size={16} />
                    </button>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-2 gap-3 p-3 bg-[var(--color-paper-dim)] rounded-lg">
                    <div>
                      <p className="text-[11px] text-[var(--color-ink-faint)] font-medium">કુલ જથ્થો (ખરીદી)</p>
                      <p className="text-[14px] font-bold mt-0.5">
                        {item.totalQuantity} {item.unit}
                      </p>
                      <p className="text-[11.5px] text-[var(--color-ink-soft)] mt-0.5">{formatCurrency(item.totalCost)}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-[var(--color-ink-faint)] font-medium">બાકી સ્ટોક</p>
                      <p className={`text-[14px] font-bold mt-0.5 ${isLow ? 'text-[var(--color-loss-500)]' : 'text-[var(--color-crop-600)]'}`}>
                        {remaining} {item.unit}
                      </p>
                      <p className="text-[11.5px] text-[var(--color-ink-soft)] mt-0.5">
                        {item.totalQuantity > 0 ? formatCurrency((item.totalCost / item.totalQuantity) * remaining) : "₹0"}
                      </p>
                    </div>
                  </div>
                  
                  {item.notes && (
                    <p className="text-[12.5px] text-[var(--color-ink-soft)] mt-3">
                      <span className="font-semibold text-[var(--color-ink)]">નોંધ:</span> {item.notes}
                    </p>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </Screen>
      
      <Dialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="સ્ટોક કાઢી નાખવો છે?"
        footer={
          <>
            <Button variant="outline" fullWidth onClick={() => setDeleteConfirm(null)}>રદ કરો</Button>
            <Button variant="danger" fullWidth onClick={handleDelete}>કાઢી નાખો</Button>
          </>
        }
      >
        "{deleteConfirm?.name}" ની નોંધ કાયમ માટે ડિલીટ થશે. (નોંધ: ખેતરમાં વપરાયેલ ખર્ચ ડિલીટ નહીં થાય).
      </Dialog>
    </>
  );
}
