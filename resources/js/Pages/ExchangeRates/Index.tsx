import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import GlassCard from '@/Components/GlassCard';
import FormField from '@/Components/FormField';
import SelectInput from '@/Components/SelectInput';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import Pagination from '@/Components/Pagination';
import EmptyState from '@/Components/EmptyState';
import ConfirmDialog from '@/Components/ConfirmDialog';
import { useI18n } from '@/Utilities/i18n';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import type { ExchangeRate, Paginated } from '@/types/domain';
import { formatDate } from '@/Utilities/format';

interface IndexProps {
    rates: Paginated<ExchangeRate>;
    currencies: { code: string; name: string }[];
    baseCurrency?: string;
}

export default function Index({ rates, currencies }: IndexProps) {
    const { t } = useI18n();
    const { data, setData, post, processing, errors } = useForm({
        base_currency_code: '',
        quote_currency_code: '',
        rate: '',
        effective_date: new Date().toISOString().slice(0, 10),
    });
    const [confirmingDelete, setConfirmingDelete] = useState<ExchangeRate | null>(null);
    const deleteForm = useForm({});

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('exchange-rates.store'));
    };

    return (
        <AuthenticatedLayout>
            <Head title={t('exchange_rates.title')} />

            <PageHeader
                title={t('exchange_rates.title')}
                description={t('exchange_rates.sub')}
            />

            <div className="grid gap-6 lg:grid-cols-3">
                <GlassCard className="p-6 lg:col-span-1">
                    <h2 className="font-heading text-xl italic text-white">{t('exchange_rates.add')}</h2>
                    <form onSubmit={submit} className="mt-5 space-y-4">
                        <FormField label={t('exchange_rates.base_currency')} required error={errors.base_currency_code} htmlFor="base_currency_code">
                            <SelectInput
                                id="base_currency_code"
                                options={currencies.map((c) => ({ value: c.code, label: `${c.code} — ${c.name}` }))}
                                value={data.base_currency_code}
                                onChange={(e) => setData('base_currency_code', e.target.value)}
                                placeholder={t('exchange_rates.select')}
                            />
                        </FormField>
                        <FormField label={t('exchange_rates.quote_currency')} required error={errors.quote_currency_code} htmlFor="quote_currency_code">
                            <SelectInput
                                id="quote_currency_code"
                                options={currencies.map((c) => ({ value: c.code, label: `${c.code} — ${c.name}` }))}
                                value={data.quote_currency_code}
                                onChange={(e) => setData('quote_currency_code', e.target.value)}
                                placeholder={t('exchange_rates.select')}
                            />
                        </FormField>
                        <FormField label={t('exchange_rates.rate')} required error={errors.rate} htmlFor="rate" hint={t('exchange_rates.rate_hint')}>
                            <TextInput
                                id="rate"
                                type="number"
                                min="0.00000001"
                                step="any"
                                value={data.rate}
                                onChange={(e) => setData('rate', e.target.value)}
                                required
                            />
                        </FormField>
                        <FormField label={t('exchange_rates.effective_date')} required error={errors.effective_date} htmlFor="effective_date">
                            <TextInput
                                id="effective_date"
                                type="date"
                                value={data.effective_date}
                                onChange={(e) => setData('effective_date', e.target.value)}
                                required
                            />
                        </FormField>
                        <PrimaryButton className="w-full" disabled={processing}>
                            {processing ? t('common.saving') : t('exchange_rates.save_rate')}
                        </PrimaryButton>
                    </form>
                </GlassCard>

                <GlassCard className="p-6 lg:col-span-2">
                    <h2 className="font-heading text-xl italic text-white">{t('exchange_rates.history')}</h2>
                    {rates.total === 0 ? (
                        <div className="mt-4">
                            <EmptyState title={t('exchange_rates.empty_title')} description={t('exchange_rates.empty_desc')} />
                        </div>
                    ) : (
                        <div className="mt-4 overflow-x-auto">
                            <table className="table-glass w-full min-w-[560px]">
                                <thead>
                                    <tr>
                                        <th>{t('exchange_rates.col_pair')}</th>
                                        <th>{t('exchange_rates.col_effective_date')}</th>
                                        <th className="text-right">{t('exchange_rates.col_rate')}</th>
                                        <th className="text-right">{t('common.actions')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rates.data.map((rate) => (
                                        <tr key={rate.id}>
                                            <td className="font-medium text-white/85">
                                                {rate.base_currency_code} → {rate.quote_currency_code}
                                                <span className="ml-2 text-xs text-white/30">
                                                    {rate.base_currency?.name} / {rate.quote_currency?.name}
                                                </span>
                                            </td>
                                            <td>{formatDate(rate.effective_date)}</td>
                                            <td className="text-right tabular-nums text-white/85">{Number(rate.rate)}</td>
                                            <td className="text-right">
                                                <button
                                                    onClick={() => setConfirmingDelete(rate)}
                                                    className="text-xs font-medium text-white/40 transition-colors hover:text-danger"
                                                >
                                                    {t('common.delete')}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    <Pagination paginator={rates} />
                </GlassCard>
            </div>

            <ConfirmDialog
                open={confirmingDelete !== null}
                onClose={() => setConfirmingDelete(null)}
                onConfirm={() =>
                    confirmingDelete && deleteForm.delete(route('exchange-rates.destroy', confirmingDelete.id))
                }
                title={t('exchange_rates.delete_confirm_title')}
                message={t('exchange_rates.delete_confirm_message')}
                confirmLabel={t('exchange_rates.delete_confirm_label')}
                processing={deleteForm.processing}
            />
        </AuthenticatedLayout>
    );
}
