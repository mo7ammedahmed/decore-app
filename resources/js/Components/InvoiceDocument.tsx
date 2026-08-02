import { money, formatDate } from '@/Utilities/format';
import { useI18n } from '@/Utilities/i18n';
import type { InvoiceTemplate } from '@/types/domain';

export interface InvoiceDocumentShop {
    name: string;
    tagline: string | null;
    logo_url: string | null;
    address: string | null;
    city: string | null;
    phone: string | null;
    email: string | null;
    tax_number: string | null;
    commercial_registration: string | null;
}

export interface InvoiceDocumentInvoice {
    invoice_number: string;
    issue_date: string;
    due_date: string | null;
    status: string;
    payment_status: string;
    currency_code: string;
    customer?: {
        name: string;
        company_name?: string | null;
        tax_number?: string | null;
        address?: string | null;
    } | null;
    items: {
        id: number;
        description: string;
        quantity: string | number;
        unit: string;
        unit_price: string;
        tax_rate: string | number;
        line_total: string;
    }[];
    subtotal: string;
    discount_total: string;
    tax_total: string;
    total: string;
    paid_total: string;
    balance_due: string;
    base_currency_code: string;
    notes?: string | null;
    created_at?: string | null;
}

interface InvoiceDocumentProps {
    shop: InvoiceDocumentShop;
    invoice: InvoiceDocumentInvoice;
    template: InvoiceTemplate;
    accent: string;
    footerNote: string | null;
    thankYou: string | null;
    baseCurrency?: string;
}

/**
 * The white \"paper\" invoice document. Rendered identically on the print page
 * and in the Settings live preview so what you pick is what gets printed.
 *
 * Templates: classic (serif, neutral), modern (accent band, bold totals),
 * minimal (quiet, centred brand). The accent colour drives the CSS variable
 * --inv-accent consumed through arbitrary Tailwind values.
 */
export default function InvoiceDocument({
    shop,
    invoice,
    template,
    accent,
    footerNote,
    thankYou,
    baseCurrency,
}: InvoiceDocumentProps) {
    const { t } = useI18n();
    const currency = invoice.currency_code;
    const initial = shop.name.charAt(0).toUpperCase();

    const logo = shop.logo_url ? (
        <img src={shop.logo_url} alt={`${shop.name} logo`} className="h-12 w-12 rounded-lg object-cover" />
    ) : (
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-900 font-serif text-xl font-bold text-white" aria-hidden="true">
            {initial}
        </span>
    );

    const header = (() => {
        if (template === 'modern') {
            return (
                <header className="flex items-center justify-between gap-4 rounded-xl px-6 py-5 text-white" style={{ backgroundColor: accent }}>
                    <div className="flex items-center gap-3">
                        {shop.logo_url ? (
                            <img src={shop.logo_url} alt={`${shop.name} logo`} className="h-12 w-12 rounded-lg object-cover" />
                        ) : (
                            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 font-sans text-xl font-bold" aria-hidden="true">
                                {initial}
                            </span>
                        )}
                        <div>
                            <p className="text-2xl font-bold tracking-tight">{shop.name}</p>
                            {shop.tagline && <p className="text-xs text-white/80">{shop.tagline}</p>}
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-xl font-bold">{invoice.invoice_number}</p>
                        <p className="text-xs text-white/80">{t('invoice_doc.issued')} {formatDate(invoice.issue_date)}</p>
                        {invoice.due_date && <p className="text-xs text-white/80">{t('invoice_doc.due')} {formatDate(invoice.due_date)}</p>}
                    </div>
                </header>
            );
        }

        if (template === 'minimal') {
            return (
                <header className="pb-8 text-center">
                    <div className="mx-auto mb-3 flex justify-center">{logo}</div>
                    <p className="text-2xl font-light uppercase tracking-[0.28em] text-neutral-800">{shop.name}</p>
                    {shop.tagline && <p className="mt-1 text-xs text-neutral-400">{shop.tagline}</p>}
                    <p className="mt-4 text-sm text-neutral-500">
                        {invoice.invoice_number} · {t('invoice_doc.issued')} {formatDate(invoice.issue_date)}
                        {invoice.due_date ? ` · ${t('invoice_doc.due')} ${formatDate(invoice.due_date)}` : ''}
                    </p>
                </header>
            );
        }

        // classic — the original look
        return (
            <header className="flex items-start justify-between border-b border-neutral-200 pb-6">
                <div className="flex items-center gap-3">
                    {shop.logo_url ? (
                        <img src={shop.logo_url} alt={`${shop.name} logo`} />
                    ) : (
                        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-900 font-serif text-xl font-bold text-white" aria-hidden="true">
                            {initial}
                        </span>
                    )}
                    <div>
                        <p className="font-serif text-3xl font-bold tracking-tight text-neutral-900">{shop.name}</p>
                        {shop.tagline && <p className="mt-1 text-sm text-neutral-500">{shop.tagline}</p>}
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-xl font-semibold text-neutral-900">{invoice.invoice_number}</p>
                    <p className="mt-1 text-sm text-neutral-500">{t('invoice_doc.issued')} {formatDate(invoice.issue_date)}</p>
                    {invoice.due_date && <p className="text-sm text-neutral-500">{t('invoice_doc.due')} {formatDate(invoice.due_date)}</p>}
                </div>
            </header>
        );
    })();

    const sectionLabel = (label: string) =>
        template === 'minimal' ? (
            <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-neutral-400">{label}</p>
        ) : (
            <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400">{label}</p>
        );

    return (
        <div dir="ltr" style={{ '--inv-accent': accent } as React.CSSProperties}>
            {header}

            <section className={`grid grid-cols-2 gap-6 text-sm ${template === 'minimal' ? 'mt-8' : 'mt-6'}`}>
                <div>
                    {sectionLabel(t('invoice_doc.billed_to'))}
                    <p className="mt-1.5 font-medium text-neutral-900">{invoice.customer?.name ?? '—'}</p>
                    {invoice.customer?.company_name && <p className="text-neutral-600">{invoice.customer.company_name}</p>}
                    {invoice.customer?.tax_number && <p className="text-neutral-600">{t('invoice_doc.vat')} {invoice.customer.tax_number}</p>}
                    {invoice.customer?.address && <p className="text-neutral-600">{invoice.customer.address}</p>}
                </div>
                <div className="text-right">
                    {sectionLabel(t('invoice_doc.from'))}
                    <p className="mt-1.5 font-medium text-neutral-900">{shop.name}</p>
                    {shop.address && <p className="text-neutral-600">{shop.address}</p>}
                    {shop.city && <p className="text-neutral-600">{shop.city}</p>}
                    {shop.phone && <p className="text-neutral-600">{shop.phone}</p>}
                    {shop.email && <p className="text-neutral-600">{shop.email}</p>}
                    {shop.tax_number && <p className="text-neutral-600">{t('invoice_doc.vat')} {shop.tax_number}</p>}
                    {shop.commercial_registration && <p className="text-neutral-600">{t('invoice_doc.cr')} {shop.commercial_registration}</p>}
                </div>
            </section>

            <table className={`mt-8 w-full text-sm ${template === 'minimal' ? '' : 'border-collapse'}`}>
                <thead>
                    <tr
                        className={
                            template === 'modern'
                                ? 'border-b-2 text-left text-[10px] font-semibold uppercase tracking-widest [color:var(--inv-accent)] [border-color:var(--inv-accent)]'
                                : 'border-b border-neutral-300 text-left text-[10px] font-semibold uppercase tracking-widest text-neutral-500'
                        }
                    >
                        <th className="pb-2">{t('invoice_doc.item')}</th>
                        <th className="pb-2 text-right">{t('invoice_doc.qty')}</th>
                        <th className="pb-2 text-right">{t('invoice_doc.unit_price')}</th>
                        <th className="pb-2 text-right">{t('invoice_doc.tax')}</th>
                        <th className="pb-2 text-right">{t('invoice_doc.amount')}</th>
                    </tr>
                </thead>
                <tbody>
                    {invoice.items.map((item) => (
                        <tr key={item.id} className="border-b border-neutral-100 align-top">
                            <td className="py-2.5">
                                <p className="font-medium text-neutral-900">{item.description}</p>
                            </td>
                            <td className="py-2.5 text-right tabular-nums text-neutral-700">
                                {Number(item.quantity)} {item.unit.replace('_', ' ')}
                            </td>
                            <td className="py-2.5 text-right tabular-nums text-neutral-700">{money(item.unit_price, currency)}</td>
                            <td className="py-2.5 text-right tabular-nums text-neutral-700">
                                {Number(item.tax_rate) > 0 ? `${item.tax_rate}%` : '—'}
                            </td>
                            <td className="py-2.5 text-right font-medium tabular-nums text-neutral-900">{money(item.line_total, currency)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className={`mt-6 ml-auto w-72 space-y-2 text-sm ${template === 'minimal' ? 'border-t border-neutral-200 pt-4' : ''}`}>
                <div className="flex justify-between text-neutral-600">
                    <span>{t('invoice_doc.subtotal')}</span>
                    <span className="tabular-nums">{money(invoice.subtotal, currency)}</span>
                </div>
                {Number(invoice.discount_total) > 0 && (
                    <div className="flex justify-between text-neutral-600">
                        <span>{t('invoice_doc.discount')}</span>
                        <span className="tabular-nums">− {money(invoice.discount_total, currency)}</span>
                    </div>
                )}
                <div className="flex justify-between text-neutral-600">
                    <span>{t('invoice_doc.tax')}</span>
                    <span className="tabular-nums">{money(invoice.tax_total, currency)}</span>
                </div>
                <div
                    className={`flex justify-between border-t border-neutral-300 pt-3 text-base font-bold text-neutral-900 ${
                        template === 'modern' ? '[color:var(--inv-accent)]' : ''
                    }`}
                >
                    <span>{t('invoice_doc.total')}</span>
                    <span className="tabular-nums">{money(invoice.total, currency)}</span>
                </div>
                <div className="flex justify-between border-t border-neutral-200 pt-2 text-neutral-700">
                    <span>{t('invoice_doc.paid')}</span>
                    <span className="tabular-nums text-neutral-900">{money(invoice.paid_total, currency)}</span>
                </div>
                <div className="flex justify-between font-semibold text-neutral-900">
                    <span>{t('invoice_doc.balance_due')}</span>
                    <span className="tabular-nums">{money(invoice.balance_due, currency)}</span>
                </div>
                {baseCurrency && baseCurrency !== currency && (
                    <p className="pt-2 text-xs text-neutral-400">
                        {t('invoice_doc.base_equivalent')} {money(invoice.total, baseCurrency)}
                    </p>
                )}
            </div>

            {invoice.notes && (
                <section className={`mt-8 rounded-lg p-4 text-sm text-neutral-600 ${template === 'minimal' ? 'bg-transparent border border-neutral-100' : 'bg-neutral-50'}`}>
                    {sectionLabel(t('invoice_doc.notes'))}
                    <p className="mt-1">{invoice.notes}</p>
                </section>
            )}

            <footer className={`mt-12 flex items-center justify-between border-t border-neutral-200 pt-4 text-xs text-neutral-400 ${template === 'minimal' ? 'mt-10' : ''}`}>
                <span>
                    {footerNote || `${t('invoice_doc.generated_by', { name: shop.name })}${invoice.created_at ? ` · ${formatDate(invoice.created_at)}` : ''}`}
                </span>
                <span>{thankYou || t('invoice_doc.thank_you')}</span>
            </footer>
        </div>
    );
}
