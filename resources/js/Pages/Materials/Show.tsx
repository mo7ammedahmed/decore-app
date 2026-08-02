import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import GlassCard from '@/Components/GlassCard';
import GlassButton from '@/Components/GlassButton';
import StatusBadge from '@/Components/StatusBadge';
import ImagePreview from '@/Components/ImagePreview';
import MoneyDisplay from '@/Components/MoneyDisplay';
import ConfirmDialog from '@/Components/ConfirmDialog';
import ImageUpload from '@/Components/ImageUpload';
import FormField from '@/Components/FormField';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import { unitKey, useI18n } from '@/Utilities/i18n';
import { Head, useForm, usePage } from '@inertiajs/react';
import { formatDate } from '@/Utilities/format';
import { useState } from 'react';
import type { Material, SupplierCostRecord } from '@/types/domain';

interface ShowProps {
    material: Material & { costRecords?: SupplierCostRecord[] };
    currency: string;
    canManageCosts?: boolean;
}

export default function Show({ material, currency, canManageCosts = false }: ShowProps) {
    const { t } = useI18n();
    const [confirmingDelete, setConfirmingDelete] = useState(false);
    const [confirmingImageRemove, setConfirmingImageRemove] = useState(false);
    const deleteForm = useForm({});
    const imageRemoveForm = useForm({});
    const role = usePage().props.auth.user?.role;
    const canManage = role === 'admin' || role === 'supplier';

    const lowStock =
        material.stock_quantity !== null &&
        material.minimum_stock_level !== null &&
        material.stock_quantity <= material.minimum_stock_level;

    const details: [string, React.ReactNode][] = [
        [t('common.sku'), material.sku],
        [t('common.supplier'), material.supplier?.name ?? '—'],
        [t('materials.classification'), material.classification?.localized_name ?? material.classification?.name_en ?? '—'],
        [t('common.unit'), t(unitKey(material.unit))],
        [t('common.currency'), material.currency_code],
        [
            t('common.stock'),
            <span key="stock" className={lowStock ? 'text-danger' : 'text-white/80'}>
                {material.stock_quantity ?? '—'}
                {material.minimum_stock_level !== null && ` / ${t('materials.min', { n: material.minimum_stock_level })}`}
                {lowStock && <span className="ml-1 text-xs">{t('materials.low')}</span>}
            </span>,
        ],
        [t('common.created'), formatDate(material.created_at ?? null)],
    ];

    return (
        <AuthenticatedLayout>
            <Head title={material.localized_name ?? material.name_en} />

            <PageHeader title={material.localized_name ?? material.name_en} description={material.description ?? material.sku}>
                {canManage && (
                    <>
                        <GlassButton href={route('materials.edit', material.id)} variant="secondary">{t('materials.edit_title')}</GlassButton>
                        <GlassButton
                            onClick={() => setConfirmingDelete(true)}
                            variant="danger"
                            as="button"
                        >
                            {t('common.archive')}
                        </GlassButton>
                    </>
                )}
            </PageHeader>

            <div className="grid gap-6 lg:grid-cols-3">
                <GlassCard className="p-6 lg:col-span-1">
                    <div className="flex items-center justify-between">
                        <h2 className="font-heading text-xl italic text-white">{t('common.details')}</h2>
                        <StatusBadge
                            label={material.is_active ? t('common.active') : t('common.archived')}
                            tone={material.is_active ? 'bg-success/15 text-success' : 'bg-white/[0.06] text-white/45'}
                        />
                    </div>

                    <dl className="mt-5 space-y-3.5 text-sm">
                        {details.map(([label, value]) => (
                            <div key={String(label)} className="flex items-start justify-between gap-4">
                                <dt className="text-white/40">{label}</dt>
                                <dd className="text-right text-white/80">{value}</dd>
                            </div>
                        ))}
                    </dl>

                    <div className="mt-6 grid grid-cols-2 gap-4 border-t border-white/[0.06] pt-5 text-center">
                        <div>
                            <MoneyDisplay value={material.selling_price} currency={currency} tone="accent" className="font-heading text-2xl italic" />
                            <p className="text-[11px] uppercase tracking-widest text-white/35">{t('common.price')}</p>
                        </div>
                        <div>
                            <p className="font-heading text-2xl italic text-accent">
                                {material.image_url ? t('common.yes') : t('common.no')}
                            </p>
                            <p className="text-[11px] uppercase tracking-widest text-white/35">{t('common.image')}</p>
                        </div>
                    </div>
                </GlassCard>

                <div className="space-y-6 lg:col-span-2">
                    <GlassCard className="p-6">
                        <div className="flex items-center justify-between gap-3">
                            <h2 className="font-heading text-xl italic text-white">{t('materials.product_image')}</h2>
                            {canManage && material.image_url && (
                                <GlassButton
                                    onClick={() => setConfirmingImageRemove(true)}
                                    variant="danger"
                                    as="button"
                                >
                                    {t('common.remove_image')}
                                </GlassButton>
                            )}
                        </div>
                        <p className="mt-2 text-sm text-white/40">
                            {t('materials.product_image_sub')}
                        </p>

                        <div className="mt-5">
                            <ImagePreview
                                url={material.image_url ?? null}
                                hex={null}
                                alt={material.localized_name ?? material.name_en}
                                size="lg"
                                className="!h-48 !w-full !rounded-xl"
                            />
                        </div>

                        {canManage && <MaterialImageForm material={material} />}
                    </GlassCard>

                    {canManageCosts && (
                        <GlassCard className="p-6">
                            <h2 className="font-heading text-xl italic text-white">{t('materials.cost_history')}</h2>
                            {!material.costRecords || material.costRecords.length === 0 ? (
                                <p className="mt-4 text-sm text-white/40">{t('materials.no_cost_history')}</p>
                            ) : (
                                <table className="table-glass mt-4 w-full text-sm">
                                    <thead>
                                        <tr>
                                            <th>{t('materials.col_effective_from')}</th>
                                            <th>{t('materials.col_cost')}</th>
                                            <th>{t('common.currency')}</th>
                                            <th className="text-right">{t('materials.col_base_cost')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {material.costRecords.map((record) => (
                                            <tr key={record.id}>
                                                <td>{formatDate(record.effective_from)}</td>
                                                <td>
                                                    <MoneyDisplay value={record.cost} currency={record.currency_code} />
                                                </td>
                                                <td>{record.currency_code}</td>
                                                <td className="text-right">
                                                    <MoneyDisplay value={record.base_cost} currency={material.currency_code} tone="muted" />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </GlassCard>
                    )}
                </div>
            </div>

            <ConfirmDialog
                open={confirmingDelete}
                onClose={() => setConfirmingDelete(false)}
                onConfirm={() => deleteForm.delete(route('materials.destroy', material.id))}
                title={t('materials.archive_confirm_title')}
                message={t('materials.archive_confirm_message')}
                confirmLabel={t('materials.archive_confirm_label')}
                processing={deleteForm.processing}
            />

            <ConfirmDialog
                open={confirmingImageRemove}
                onClose={() => setConfirmingImageRemove(false)}
                onConfirm={() => imageRemoveForm.delete(route('materials.image.destroy', material.id))}
                title={t('materials.remove_image_confirm_title')}
                message={t('materials.remove_image_confirm_message')}
                confirmLabel={t('materials.remove_image_confirm_label')}
                processing={imageRemoveForm.processing}
            />
        </AuthenticatedLayout>
    );
}

/**
 * Inline upload/replace form for the material's product image.
 */
function MaterialImageForm({ material }: { material: Material }) {
    const { t } = useI18n();
    const isReplacement = Boolean(material.image_url);
    const { data, setData, post, put, processing, errors } = useForm<{
        image: File | null;
        alt_text: string;
    }>({
        image: null,
        alt_text: material.image_alt_text ?? '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isReplacement) {
            put(route('materials.image.update', material.id));
        } else {
            post(route('materials.image.store', material.id));
        }
    };

    return (
        <form onSubmit={submit} className="mt-6 space-y-5 border-t border-white/[0.06] pt-6">
            <FormField
                label={isReplacement ? t('common.replace_image') : t('common.upload_image')}
                required
                error={errors.image}
                hint={t('materials.image_hint')}
            >
                <ImageUpload
                    value={data.image}
                    onChange={(file) => setData('image', file)}
                    error={errors.image}
                    existingUrl={material.image_url ?? null}
                    altText={data.alt_text}
                />
            </FormField>

            <FormField label={t('common.alt_text')} error={errors.alt_text} htmlFor="alt_text">
                <TextInput
                    id="alt_text"
                    value={data.alt_text}
                    onChange={(e) => setData('alt_text', e.target.value)}
                    placeholder={t('materials.alt_placeholder')}
                />
            </FormField>

            <div className="flex items-center justify-end gap-3">
                <PrimaryButton disabled={processing || !data.image}>
                    {processing ? t('common.uploading') : isReplacement ? t('common.replace_image') : t('common.upload_image')}
                </PrimaryButton>
            </div>
        </form>
    );
}
