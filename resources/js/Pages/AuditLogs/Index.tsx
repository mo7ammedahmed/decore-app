import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import GlassCard from '@/Components/GlassCard';
import Pagination from '@/Components/Pagination';
import EmptyState from '@/Components/EmptyState';
import SelectInput from '@/Components/SelectInput';
import DateInput from '@/Components/DateInput';
import { useI18n } from '@/Utilities/i18n';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import type { AuditLog, Paginated } from '@/types/domain';
import { actionLabel, formatDateTime } from '@/Utilities/format';

interface IndexProps {
    logs: Paginated<AuditLog>;
    filters: { action?: string; from?: string; to?: string };
    actions: string[];
}

export default function Index({ logs, filters, actions }: IndexProps) {
    const { t } = useI18n();
    const [from, setFrom] = useState(filters.from ?? '');
    const [to, setTo] = useState(filters.to ?? '');

    const applyFilters = () => {
        router.get(
            route('audit-logs.index'),
            { ...filters, from: from || undefined, to: to || undefined },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const updateAction = (action: string) => {
        router.get(
            route('audit-logs.index'),
            { ...filters, action: action || undefined },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title={t('audit_logs.title')} />

            <PageHeader
                title={t('audit_logs.title')}
                description={t('audit_logs.sub')}
            />

            <GlassCard className="p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <SelectInput
                        options={actions.map((a) => ({ value: a, label: actionLabel(a) }))}
                        value={filters.action ?? ''}
                        onChange={(e) => updateAction(e.target.value)}
                        placeholder={t('audit_logs.all_actions')}
                        className="sm:w-72"
                        aria-label={t('audit_logs.filter_action')}
                    />
                    <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
                        <DateInput
                            className="min-w-0 flex-1 sm:w-40 sm:flex-none"
                            value={from}
                            onChange={(e) => setFrom(e.target.value)}
                            aria-label={t('invoices.from_date')}
                        />
                        <span className="shrink-0 text-white/30">→</span>
                        <DateInput
                            className="min-w-0 flex-1 sm:w-40 sm:flex-none"
                            value={to}
                            onChange={(e) => setTo(e.target.value)}
                            aria-label={t('invoices.to_date')}
                        />
                        <button
                            onClick={applyFilters}
                            className="shrink-0 rounded-full bg-accent/15 px-4 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent/25"
                        >
                            {t('audit_logs.apply')}
                        </button>
                    </div>
                </div>

                {logs.total === 0 ? (
                    <div className="mt-6">
                        <EmptyState title={t('audit_logs.empty_title')} description={t('audit_logs.empty_desc')} />
                    </div>
                ) : (
                    <div className="mt-5 space-y-3">
                        {logs.data.map((log) => (
                            <div
                                key={log.id}
                                className="flex flex-col gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                            >
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-white/90">{actionLabel(log.action)}</p>
                                    <p className="mt-0.5 text-xs text-white/40">
                                        {log.user?.name ?? t('audit_logs.system')} · {formatDateTime(log.created_at)}
                                        {log.ip_address && ` · ${log.ip_address}`}
                                    </p>
                                </div>
                                <div className="flex items-center gap-4 text-xs">
                                    {log.auditable_type && (
                                        <span className="rounded-full bg-white/[0.06] px-3 py-1 text-white/50">
                                            {log.auditable_type.replace('App\\Models\\', '')} #{log.auditable_id}
                                        </span>
                                    )}
                                    <span className="rounded-full bg-white/[0.06] px-3 py-1 text-white/50">{log.id}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <Pagination paginator={logs} />
            </GlassCard>
        </AuthenticatedLayout>
    );
}
