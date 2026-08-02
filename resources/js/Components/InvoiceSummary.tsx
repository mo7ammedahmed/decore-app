import type { DiscountType } from '@/types/domain';
import { money } from '@/Utilities/format';
import { useI18n } from '@/Utilities/i18n';
import type { ItemTotals } from '@/Components/InvoiceItemsEditor';

interface InvoiceSummaryProps {
    totals: ItemTotals;
    currency: string | null;
    discountType: DiscountType;
    discountValue: string;
    onDiscountTypeChange: (value: DiscountType) => void;
    onDiscountValueChange: (value: string) => void;
    editable?: boolean;
}

export default function InvoiceSummary({
    totals,
    currency,
    discountType,
    discountValue,
    onDiscountTypeChange,
    onDiscountValueChange,
    editable = true,
}: InvoiceSummaryProps) {
    const { t } = useI18n();
    const subtotal = Number(totals.subtotal) || 0;
    const invoiceDiscount =
        discountType === 'percentage'
            ? round2(subtotal * ((Number(discountValue) || 0) / 100))
            : discountType === 'fixed'
              ? round2(Number(discountValue) || 0)
              : 0;
    const grandTotal = round2(Number(totals.subtotal) - Number(totals.discount) - invoiceDiscount + Number(totals.tax));

    return (
        <div className="liquid-glass rounded-[1.25rem] p-6">
            <h3 className="font-heading text-xl italic text-white">{t('invoice_summary.summary')}</h3>

            <div className="mt-5 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                    <span className="text-white/50">{t('invoice_summary.subtotal')}</span>
                    <span className="tabular-nums text-white/85">{money(totals.subtotal, currency)}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-white/50">{t('invoice_summary.line_discounts')}</span>
                    <span className="tabular-nums text-white/85">− {money(totals.discount, currency)}</span>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-t border-white/[0.06] pt-3">
                    <span className="text-white/50">{t('invoice_summary.invoice_discount')}</span>
                    {editable ? (
                        <div className="flex items-center gap-2">
                            <select
                                className="form-select w-32"
                                value={discountType}
                                onChange={(e) => onDiscountTypeChange(e.target.value as DiscountType)}
                            >
                                <option value="none" className="bg-neutral-900">{t('invoice_summary.none')}</option>
                                <option value="percentage" className="bg-neutral-900">%</option>
                                <option value="fixed" className="bg-neutral-900">{t('invoice_summary.fixed')}</option>
                            </select>
                            {discountType !== 'none' && (
                                <input
                                    type="number"
                                    min="0"
                                    step="any"
                                    className="form-input w-24"
                                    value={discountValue}
                                    onChange={(e) => onDiscountValueChange(e.target.value)}
                                />
                            )}
                        </div>
                    ) : (
                        <span className="tabular-nums text-white/85">
                            {money(invoiceDiscount, currency)}
                        </span>
                    )}
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-white/50">{t('invoice_summary.tax_total')}</span>
                    <span className="tabular-nums text-white/85">{money(totals.tax, currency)}</span>
                </div>

                <div className="flex items-center justify-between border-t border-white/[0.08] pt-4">
                    <span className="font-heading text-lg italic text-white">{t('invoice_summary.total')}</span>
                    <span className="font-heading text-2xl italic tabular-nums text-accent">
                        {money(grandTotal.toFixed(2), currency)}
                    </span>
                </div>
            </div>
        </div>
    );
}

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
