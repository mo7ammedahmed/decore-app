import { Head, Link } from '@inertiajs/react';
import InvoiceDocument from '@/Components/InvoiceDocument';
import type { InvoiceTemplate } from '@/types/domain';
import type { Invoice } from '@/types/domain';

interface PrintProps {
    invoice: Invoice & { items: NonNullable<Invoice['items']> };
    baseCurrency: string;
    settings: {
        name: string;
        tagline: string | null;
        logo_url: string | null;
        phone: string | null;
        email: string | null;
        address: string | null;
        city: string | null;
        tax_number: string | null;
        commercial_registration: string | null;
        template: InvoiceTemplate;
        accent: string;
        footer_note: string | null;
        thank_you: string | null;
    };
}

/**
 * Print-friendly invoice — the paper document is driven entirely by the
 * admin's shop settings (name, logo, contact details, template style, accent).
 */
export default function Print({ invoice, baseCurrency, settings }: PrintProps) {
    return (
        <>
            <Head title={`Print ${invoice.invoice_number}`} />

            <div className="print-toolbar">
                <Link href={route('invoices.show', invoice.id)} className="rounded-full bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20">
                    ← Back
                </Link>
                <button onClick={() => window.print()} className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-neutral-900 hover:bg-white/80">
                    Print / Save PDF
                </button>
            </div>

            <div className="print-page" dir="ltr">
                <InvoiceDocument
                    shop={{
                        name: settings.name,
                        tagline: settings.tagline,
                        logo_url: settings.logo_url,
                        address: settings.address,
                        city: settings.city,
                        phone: settings.phone,
                        email: settings.email,
                        tax_number: settings.tax_number,
                        commercial_registration: settings.commercial_registration,
                    }}
                    invoice={invoice}
                    template={settings.template}
                    accent={settings.accent}
                    footerNote={settings.footer_note}
                    thankYou={settings.thank_you}
                    baseCurrency={baseCurrency}
                />
            </div>
        </>
    );
}
