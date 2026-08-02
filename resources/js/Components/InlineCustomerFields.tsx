import FormField from '@/Components/FormField';
import TextInput from '@/Components/TextInput';
import { useI18n } from '@/Utilities/i18n';

/**
 * Fields for creating a customer inline while creating or editing an invoice,
 * so a walk-in client never has to be added as a customer first.
 */

export interface NewCustomer {
    name: string;
    company_name: string;
    email: string;
    phone: string;
    tax_number: string;
    city: string;
    country_code: string;
}

export const blankCustomer: NewCustomer = {
    name: '',
    company_name: '',
    email: '',
    phone: '',
    tax_number: '',
    city: '',
    country_code: 'SA',
};

interface InlineCustomerFieldsProps {
    customer: NewCustomer | null;
    errors: Record<string, string>;
    setField: (field: keyof NewCustomer, value: string) => void;
    onCancel: () => void;
}

export default function InlineCustomerFields({ customer, errors, setField, onCancel }: InlineCustomerFieldsProps) {
    const { t } = useI18n();

    return (
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 sm:col-span-2">
            <div className="mb-3 flex items-center justify-between gap-2">
                <p className="font-heading text-sm italic text-white/80">{t('customers.new')}</p>
                <button
                    type="button"
                    onClick={onCancel}
                    className="text-xs font-medium text-white/50 transition-colors hover:text-accent"
                >
                    {t('inline_customer.choose_existing')}
                </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
                <FormField label={t('common.name')} required error={errors['customer.name']} htmlFor="new_customer_name">
                    <TextInput
                        id="new_customer_name"
                        value={customer?.name ?? ''}
                        onChange={(e) => setField('name', e.target.value)}
                        autoFocus
                    />
                </FormField>
                <FormField label={t('common.company_name')} error={errors['customer.company_name']} htmlFor="new_customer_company">
                    <TextInput
                        id="new_customer_company"
                        value={customer?.company_name ?? ''}
                        onChange={(e) => setField('company_name', e.target.value)}
                    />
                </FormField>
                <FormField label={t('common.email')} error={errors['customer.email']} htmlFor="new_customer_email">
                    <TextInput
                        id="new_customer_email"
                        type="email"
                        value={customer?.email ?? ''}
                        onChange={(e) => setField('email', e.target.value)}
                    />
                </FormField>
                <FormField label={t('common.phone')} error={errors['customer.phone']} htmlFor="new_customer_phone">
                    <TextInput
                        id="new_customer_phone"
                        value={customer?.phone ?? ''}
                        onChange={(e) => setField('phone', e.target.value)}
                        placeholder={t('common.phone_placeholder')}
                    />
                </FormField>
                <FormField label={t('common.tax_number')} error={errors['customer.tax_number']} htmlFor="new_customer_tax">
                    <TextInput
                        id="new_customer_tax"
                        value={customer?.tax_number ?? ''}
                        onChange={(e) => setField('tax_number', e.target.value)}
                    />
                </FormField>
                <FormField label={t('common.city')} error={errors['customer.city']} htmlFor="new_customer_city">
                    <TextInput
                        id="new_customer_city"
                        value={customer?.city ?? ''}
                        onChange={(e) => setField('city', e.target.value)}
                    />
                </FormField>
            </div>
        </div>
    );
}
