import type { Material } from '@/types/domain';
import { money } from '@/Utilities/format';

export interface EditableItem {
    material_id: string;
    quantity: string;
    unit_price: string;
    unit_cost: string;
    discount_amount: string;
    tax_rate: string;
    description: string;
}

export interface ItemTotals {
    subtotal: string;
    discount: string;
    tax: string;
    total: string;
}

interface InvoiceItemsEditorProps {
    items: EditableItem[];
    materials: Material[];
    taxRates: { id: number; name: string; rate: string; is_default: boolean }[];
    canManageCosts: boolean;
    errors?: Record<string, string>;
    onChange: (items: EditableItem[]) => void;
}

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

/**
 * Live client-side totals — the server remains the authoritative calculator.
 */
export function computeItemTotals(items: EditableItem[]): ItemTotals {
    let subtotal = 0;
    let discount = 0;
    let tax = 0;

    for (const item of items) {
        const price = Number(item.unit_price) || 0;
        const qty = Number(item.quantity) || 0;
        const lineSubtotal = round2(price * qty);
        const lineDiscount = round2(Number(item.discount_amount) || 0);
        const rate = Number(item.tax_rate) || 0;

        subtotal += lineSubtotal;
        discount += lineDiscount;
        tax += round2((lineSubtotal - lineDiscount) * (rate / 100));
    }

    return {
        subtotal: subtotal.toFixed(2),
        discount: discount.toFixed(2),
        tax: tax.toFixed(2),
        total: round2(subtotal - discount + tax).toFixed(2),
    };
}

export default function InvoiceItemsEditor({
    items,
    materials,
    taxRates,
    canManageCosts,
    errors,
    onChange,
}: InvoiceItemsEditorProps) {
    const update = (index: number, patch: Partial<EditableItem>) => {
        const next = items.map((item, i) => (i === index ? { ...item, ...patch } : item));
        onChange(next);
    };

    const addRow = () => {
        const defaultMaterial = materials[0];

        onChange([
            ...items,
            {
                material_id: defaultMaterial ? String(defaultMaterial.id) : '',
                quantity: '1',
                unit_price: defaultMaterial ? defaultMaterial.selling_price : '',
                unit_cost: '',
                discount_amount: '0',
                tax_rate: String(taxRates.find((t) => t.is_default)?.rate ?? 0),
                description: '',
            },
        ]);
    };

    const removeRow = (index: number) => {
        if (items.length === 1) return;
        onChange(items.filter((_, i) => i !== index));
    };

    const selectMaterial = (index: number, materialId: string) => {
        const material = materials.find((m) => String(m.id) === materialId);

        update(index, {
            material_id: materialId,
            unit_price: material ? material.selling_price : '',
            description: material?.localized_name ?? material?.name_en ?? '',
        });
    };

    // Inertia reports nested errors under keys like `items.0.material_id`.
    const errorFor = (index: number, field: string): string | undefined =>
        errors?.[`items.${index}.${field}`];

    return (
        <div>
            <div className="overflow-x-auto rounded-card">
                <table className="w-full min-w-[640px] text-sm">
                    <thead>
                        <tr className="border-b border-white/[0.08]">
                            <th className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">Material</th>
                            <th className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">Qty</th>
                            <th className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">Unit Price</th>
                            {canManageCosts && (
                                <th className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">Unit Cost</th>
                            )}
                            <th className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">Discount</th>
                            <th className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">Tax %</th>
                            <th className="px-3 py-2.5 text-right text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">Line Total</th>
                            <th className="w-10" />
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, index) => {
                            const lineSubtotal = round2((Number(item.unit_price) || 0) * (Number(item.quantity) || 0));
                            const lineDiscount = round2(Number(item.discount_amount) || 0);
                            const rate = Number(item.tax_rate) || 0;
                            const lineTax = round2((lineSubtotal - lineDiscount) * (rate / 100));
                            const lineTotal = round2(lineSubtotal - lineDiscount + lineTax);

                            return (
                                <tr key={index} className="border-b border-white/[0.05] align-top">
                                    <td className="px-3 py-2.5">
                                        <select
                                            className="form-select min-w-40"
                                            value={item.material_id}
                                            onChange={(e) => selectMaterial(index, e.target.value)}
                                        >
                                            <option value="" className="bg-neutral-900">Select material…</option>
                                            {materials.map((m) => (
                                                <option key={m.id} value={m.id} className="bg-neutral-900">
                                                    {m.localized_name ?? m.name_en}
                                                </option>
                                            ))}
                                        </select>
                                        {errorFor(index, 'material_id') && (
                                            <p className="field-error mt-1">{errorFor(index, 'material_id')}</p>
                                        )}
                                    </td>
                                    <td className="px-3 py-2.5">
                                        <input
                                            type="number"
                                            min="0.01"
                                            step="any"
                                            className="form-input w-20"
                                            value={item.quantity}
                                            onChange={(e) => update(index, { quantity: e.target.value })}
                                        />
                                        {errorFor(index, 'quantity') && (
                                            <p className="field-error mt-1">{errorFor(index, 'quantity')}</p>
                                        )}
                                    </td>
                                    <td className="px-3 py-2.5">
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            className="form-input w-28"
                                            value={item.unit_price}
                                            onChange={(e) => update(index, { unit_price: e.target.value })}
                                        />
                                        {errorFor(index, 'unit_price') && (
                                            <p className="field-error mt-1">{errorFor(index, 'unit_price')}</p>
                                        )}
                                    </td>
                                    {canManageCosts && (
                                        <td className="px-3 py-2.5">
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                className="form-input w-28"
                                                value={item.unit_cost}
                                                onChange={(e) => update(index, { unit_cost: e.target.value })}
                                            />
                                            {errorFor(index, 'unit_cost') && (
                                                <p className="field-error mt-1">{errorFor(index, 'unit_cost')}</p>
                                            )}
                                        </td>
                                    )}
                                    <td className="px-3 py-2.5">
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            className="form-input w-24"
                                            value={item.discount_amount}
                                            onChange={(e) => update(index, { discount_amount: e.target.value })}
                                        />
                                        {errorFor(index, 'discount_amount') && (
                                            <p className="field-error mt-1">{errorFor(index, 'discount_amount')}</p>
                                        )}
                                    </td>
                                    <td className="px-3 py-2.5">
                                        <select
                                            className="form-select w-24"
                                            value={item.tax_rate}
                                            onChange={(e) => update(index, { tax_rate: e.target.value })}
                                        >
                                            {taxRates.map((t) => (
                                                <option key={t.id} value={t.rate} className="bg-neutral-900">
                                                    {t.name} ({t.rate}%)
                                                </option>
                                            ))}
                                        </select>
                                        {errorFor(index, 'tax_rate') && (
                                            <p className="field-error mt-1">{errorFor(index, 'tax_rate')}</p>
                                        )}
                                    </td>
                                    <td className="px-3 py-2.5 text-right">
                                        <span className="tabular-nums text-white/85">{money(lineTotal)}</span>
                                    </td>
                                    <td className="px-1 py-2.5">
                                        <button
                                            type="button"
                                            onClick={() => removeRow(index)}
                                            disabled={items.length === 1}
                                            className="rounded-full p-1.5 text-white/35 transition-colors hover:bg-danger/10 hover:text-danger disabled:opacity-30"
                                            aria-label={`Remove line ${index + 1}`}
                                        >
                                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
                                                <path d="M6 6l12 12M18 6L6 18" />
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="mt-4 flex items-center justify-between">
                <button
                    type="button"
                    onClick={addRow}
                    className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent/10"
                >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
                        <path d="M12 5v14M5 12h14" />
                    </svg>
                    Add line item
                </button>
                {typeof errors?.items === 'string' && (
                    <p className="field-error">{errors.items}</p>
                )}
            </div>
        </div>
    );
}
