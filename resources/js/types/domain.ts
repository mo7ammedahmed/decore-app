// ---------------------------------------------------------------------------
// Decore — shared domain types (mirror the Laravel/Inertia payloads)
// ---------------------------------------------------------------------------

export type Role = 'admin' | 'accountant' | 'sales_staff' | 'supplier';

export type InvoiceStatus = 'draft' | 'issued' | 'cancelled' | 'completed';

export type PaymentStatus = 'unpaid' | 'partial' | 'paid' | 'overpaid';

export type PaymentMethod = 'cash' | 'bank_transfer' | 'card' | 'cheque' | 'other';

export type DiscountType = 'none' | 'percentage' | 'fixed';

export type Unit = 'piece' | 'square_meter' | 'meter' | 'box' | 'sheet';

// ---------------------------------------------------------------------------

export interface AuthUser {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    role: Role;
    role_label: string;
    supplier_id: number | null;
    is_active: boolean;
    email_verified_at?: string | null;
}

export interface Permissions {
    users: boolean;
    suppliers: boolean;
    classifications: boolean;
    materials: boolean;
    customers: boolean;
    invoices: boolean;
    payments: boolean;
    taxes: boolean;
    currencies: boolean;
    exchangeRates: boolean;
    reports: boolean;
    auditLogs: boolean;
    settings: boolean;
    manageCosts: boolean;
    supplierOnly: boolean;
}

export type InvoiceTemplate = 'classic' | 'modern' | 'minimal';

/**
 * Brand identity shared with every page (guests included) — the editable
 * values an admin manages on the Settings page.
 */
export interface ShopSettings {
    shop_name: string;
    tagline: string | null;
    logo_url: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    city: string | null;
    country_code: string | null;
    tax_number: string | null;
    commercial_registration: string | null;
    invoice_template: InvoiceTemplate;
    invoice_accent: string;
    invoice_footer_note: string | null;
    invoice_thank_you: string | null;
}

export interface Flash {
    success?: string;
    error?: string;
}

export interface PageProps {
    auth: { user: AuthUser | null };
    flash: Flash;
    permissions: Permissions | null;
    shop?: ShopSettings | null;
    /** Admin-editable overrides for visitor-facing text (empty => code default). */
    site_content?: Record<string, { en?: string | null; ar?: string | null }>;
}

// ---------------------------------------------------------------------------

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface Paginated<T> {
    data: T[];
    links: PaginationLink[];
    current_page: number;
    first_page_url: string;
    from: number | null;
    last_page: number;
    last_page_url: string;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number | null;
    total: number;
}

// ---------------------------------------------------------------------------

export interface User {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    role: Role;
    role_label?: string;
    supplier_id: number | null;
    is_active: boolean;
    email_verified_at?: string | null;
    supplier?: { id: number; name: string } | null;
    created_at?: string;
    invoices_count?: number;
}

export interface Supplier {
    id: number;
    name: string;
    company_name: string | null;
    contact_person: string | null;
    email: string | null;
    phone: string | null;
    tax_number: string | null;
    commercial_registration: string | null;
    address: string | null;
    city: string | null;
    country_code: string | null;
    notes: string | null;
    is_active: boolean;
    materials_count?: number;
    users_count?: number;
    materials?: Material[];
    users?: User[];
    created_at?: string;
}

export interface Classification {
    id: number;
    name_en: string;
    name_ar?: string | null;
    /** Locale-aware display name (Arabic when the active locale is ar). */
    localized_name?: string;
    slug: string;
    description: string | null;
    is_active: boolean;
    sort_order: number;
    materials_count?: number;
}

export interface Material {
    id: number;
    supplier_id: number;
    classification_id: number;
    name_en: string;
    name_ar?: string | null;
    /** Locale-aware display name (Arabic when the active locale is ar). */
    localized_name?: string;
    slug: string;
    sku: string;
    description: string | null;
    unit: Unit;
    selling_price: string;
    default_supplier_cost: string;
    currency_code: string;
    stock_quantity: number | null;
    minimum_stock_level: number | null;
    is_active: boolean;
    image_disk?: string | null;
    image_path?: string | null;
    image_url?: string | null;
    image_original_name?: string | null;
    image_mime_type?: string | null;
    image_size?: number | null;
    image_alt_text?: string | null;
    supplier?: { id: number; name: string } | null;
    classification?: { id: number; name_en: string; localized_name?: string } | null;
    costRecords?: SupplierCostRecord[];
    created_at?: string;
}

/**
 * Material as exposed on public guest pages — supplier cost and cost history
 * are deliberately absent (trade secrets must never reach the public catalog).
 */
export interface PublicMaterial {
    id: number;
    supplier_id: number;
    classification_id: number;
    name_en: string;
    name_ar?: string | null;
    /** Locale-aware display name (Arabic when the active locale is ar). */
    localized_name?: string;
    slug: string;
    sku: string;
    description: string | null;
    unit: Unit;
    selling_price: string;
    currency_code: string;
    stock_quantity: number | null;
    minimum_stock_level: number | null;
    is_active: boolean;
    image_disk?: string | null;
    image_path?: string | null;
    image_url?: string | null;
    image_alt_text?: string | null;
    supplier?: { id: number; name: string } | null;
    classification?: { id: number; name_en: string; localized_name?: string } | null;
    created_at?: string;
}

export interface Customer {
    id: number;
    name: string;
    company_name: string | null;
    email: string | null;
    phone: string | null;
    tax_number: string | null;
    address: string | null;
    city: string | null;
    country_code: string | null;
    notes: string | null;
    created_by: number | null;
    invoices_count?: number;
    invoices?: Invoice[];
    creator?: { id: number; name: string } | null;
    created_at?: string;
}

export interface TaxRate {
    id: number;
    name: string;
    rate: string;
    is_default: boolean;
    is_active: boolean;
}

export interface Currency {
    code: string;
    name: string;
    symbol: string | null;
    decimal_places: number;
    is_base: boolean;
    is_active: boolean;
    exchange_rates_count?: number;
}

export interface ExchangeRate {
    id: number;
    base_currency_code: string;
    quote_currency_code: string;
    rate: string;
    effective_date: string;
    base_currency?: { code: string; name: string };
    quote_currency?: { code: string; name: string };
}

export interface InvoiceItem {
    id: number;
    invoice_id: number;
    material_id: number | null;
    supplier_id: number | null;
    classification_id: number | null;
    description: string;
    quantity: string;
    unit: Unit;
    unit_price: string;
    unit_cost: string;
    discount_amount: string;
    tax_rate: string;
    tax_amount: string;
    line_subtotal: string;
    line_total: string;
    base_unit_price: string;
    base_unit_cost: string;
    base_line_total: string;
    material?: { id: number; name: string; sku: string } | null;
}

export interface Invoice {
    id: number;
    invoice_number: string;
    customer_id: number;
    created_by: number;
    issue_date: string;
    due_date: string | null;
    status: InvoiceStatus;
    payment_status: PaymentStatus;
    currency_code: string;
    base_currency_code: string;
    exchange_rate: string;
    subtotal: string;
    discount_type: DiscountType;
    discount_value: string;
    discount_total: string;
    tax_total: string;
    total: string;
    base_subtotal: string;
    base_tax_total: string;
    base_total: string;
    paid_total: string;
    balance_due: string;
    notes: string | null;
    customer?: Customer | { id: number; name: string } | null;
    creator?: { id: number; name: string } | null;
    items?: InvoiceItem[];
    payments?: Payment[];
    created_at?: string;
}

export interface Payment {
    id: number;
    invoice_id: number;
    recorded_by: number;
    payment_number: string;
    amount: string;
    currency_code: string;
    exchange_rate: string;
    base_amount: string;
    payment_method: PaymentMethod;
    paid_at: string;
    reference: string | null;
    notes: string | null;
    reversed_at: string | null;
    reversed_by: number | null;
    invoice?: { id: number; invoice_number: string } | null;
    recorder?: { id: number; name: string } | null;
}

export interface SupplierCostRecord {
    id: number;
    supplier_id: number;
    material_id: number;
    cost: string;
    currency_code: string;
    exchange_rate: string;
    base_cost: string;
    effective_from: string;
    effective_until: string | null;
    recorded_by: number | null;
}

export interface AuditLog {
    id: number;
    user_id: number | null;
    action: string;
    auditable_type: string | null;
    auditable_id: number | null;
    old_values: Record<string, unknown> | null;
    new_values: Record<string, unknown> | null;
    ip_address: string | null;
    user_agent: string | null;
    created_at: string;
    user?: { id: number; name: string } | null;
}

// ---------------------------------------------------------------------------
// Dashboard / report payloads
// ---------------------------------------------------------------------------

export interface MetricFinancial {
    revenue: string;
    costs: string;
    gross_profit: string;
    margin: string;
    payments_received: string;
    outstanding_balance: string;
    overdue_count: number;
    due_soon_count: number;
    // Sales-role extras
    personal_sales_total?: string;
    outstanding_follow_ups?: number;
}

export interface CountSummary {
    suppliers: number;
    materials: number;
    customers: number;
    invoices: number;
    // Sales-role extras
    draft_invoices?: number;
    issued_invoices?: number;
    // Supplier-role extras
    active_materials?: number;
    missing_images?: number;
}

export interface TopSellingRow {
    material_id: number;
    name: string;
    total_qty: number;
    revenue: string;
}

export interface MonthRow {
    month: string;
    revenue?: string;
    payments?: string;
}

export interface CategoryRevenueRow {
    name: string;
    revenue: string;
}

export interface LowStockMaterial extends Material {
    stock_quantity: number;
    minimum_stock_level: number;
}

export interface DashboardMetrics {
    counts?: CountSummary;
    financial?: MetricFinancial;
    recent_invoices?: Invoice[];
    recent_payments?: Payment[];
    low_stock?: LowStockMaterial[];
    top_selling?: TopSellingRow[];
    revenue_by_month?: MonthRow[];
    revenue_by_classification?: CategoryRevenueRow[];
    revenue_by_supplier?: CategoryRevenueRow[];
    overdue_invoices?: Invoice[];
    payments_by_month?: MonthRow[];
    draft_invoices?: number;
    issued_invoices?: number;
    personal_sales_total?: string;
    recent_customers?: Customer[];
    popular_materials?: { material_id: number; description: string; total_qty: number }[];
    follow_ups?: Invoice[];
    active_materials?: number;
    missing_images?: number;
    recent_materials?: Material[];
}
