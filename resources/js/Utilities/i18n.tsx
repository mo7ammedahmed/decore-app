import { router } from '@inertiajs/react';
import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

/**
 * Locale infrastructure for Decore.
 *
 * The active locale lives on the server (persisted in a cookie) and is shared
 * into every page via the Inertia `locale` prop. Switching locale posts to
 * `locale.update`, the server redirects back to the same URL, and the new
 * shared prop re-renders the tree — so `t()` stays in sync everywhere.
 *
 * Keep this list in sync with `config/app.php` → `available_locales`.
 */
export const LOCALES = {
    en: 'English',
    ar: 'العربية',
} as const;

export type Locale = keyof typeof LOCALES;

/** English is the source of truth for the key set — every key must exist here. */
const en = {
    // ---- Global ----
    'common.open_dashboard': 'Open dashboard',
    'common.sign_in': 'Sign in',
    'common.save': 'Save',
    'common.saved': 'Saved.',
    'common.cancel': 'Cancel',
    'common.log_out': 'Log Out',
    'common.back': 'Back',
    'common.period': 'Period',
    'common.view_all': 'View all',

    // ---- Navigation (public) ----
    'nav.home': 'Home',
    'nav.catalog': 'Catalog',
    'nav.gallery': 'Gallery',
    'nav.about': 'About',
    'nav.contact': 'Contact',
    'nav.language': 'Language',
    'nav.main': 'Main navigation',
    'nav.footer': 'Footer',

    // ---- Navigation (sidebar) ----
    'nav.dashboard': 'Dashboard',
    'nav.users': 'Users',
    'nav.suppliers': 'Suppliers',
    'nav.classifications': 'Classifications',
    'nav.materials': 'Materials',
    'nav.customers': 'Customers',
    'nav.invoices': 'Invoices',
    'nav.payments': 'Payments',
    'nav.taxes': 'Taxes',
    'nav.currencies': 'Currencies',
    'nav.exchange_rates': 'Exchange Rates',
    'nav.reports': 'Reports',
    'nav.audit_log': 'Audit Log',
    'nav.settings': 'Settings',
    'nav.site_content': 'Public site content',
    'nav.public_profile': 'Public profile',
    'nav.gallery_admin': 'Gallery',
    'nav.integrations': 'Pixels & Integrations',
    'nav.materials_atelier': 'Materials Atelier',
    'nav.supplier_id': 'Supplier #{id}',
    'nav.profile_settings': 'Profile settings',
    'nav.skip_to_content': 'Skip to content',
    'nav.toggle_navigation': 'Toggle navigation',
    'nav.close_navigation': 'Close navigation',

    // ---- Roles ----
    'role.admin': 'Administrator',
    'role.accountant': 'Accountant',
    'role.sales': 'Sales Staff',
    'role.supplier': 'Supplier',

    // ---- Public layout ----
    'public.tagline': 'Decoration materials atelier',

    // ---- Appearance ----
    'theme.switch_to_light': 'Switch to light mode',
    'theme.switch_to_dark': 'Switch to dark mode',

    // ---- Floating contact buttons ----
    'fab.call': 'Call us',
    'fab.whatsapp': 'Chat on WhatsApp',

    // ---- Landing ----
    'landing.hero_line1': 'The surfaces that',
    'landing.hero_accent': 'define',
    'landing.hero_line2': 'a space.',
    'landing.hero_sub':
        'Wood alternatives, marble looks, wall panels, flooring and profiles — curated from partner suppliers, priced transparently, delivered for your next project.',
    'landing.browse_catalog': 'Browse the catalog',
    'landing.hero_badge_tag': 'New',
    'landing.hero_badge': 'New finishes from partner suppliers — Q3 2026',
    'landing.trust_label': 'Trusted by partner suppliers',
    'landing.stat_materials': 'Materials',
    'landing.stat_classifications': 'Collections',
    'landing.stat_suppliers': 'Partner suppliers',
    'landing.atelier_eyebrow': 'The atelier',
    'landing.capabilities_eyebrow': '// The atelier',
    'landing.capabilities_title': 'Curated finishes, end to end',
    'landing.capabilities_sub':
        'One workspace for the whole material journey — curation, honest pricing, and a self-service portal for the suppliers who stock the atelier.',
    'landing.cap1_title': 'Materials',
    'landing.cap1_body':
        'Wood alternatives, marble looks, wall panels, flooring and profiles — live from partner suppliers, priced per unit, ready for your next project.',
    'landing.cap2_title': 'Pricing & Invoicing',
    'landing.cap2_body':
        'Transparent per-unit pricing with configurable VAT and multi-currency conversion. Every invoice total is recalculated and validated on the server.',
    'landing.cap3_title': 'Supplier Workspace',
    'landing.cap3_body':
        'Suppliers manage their own catalogue, product imagery and cost history through a dedicated workspace — no phone calls or spreadsheets required.',
    'landing.cap2_tag1': 'Transparent pricing',
    'landing.cap2_tag2': 'VAT rates',
    'landing.cap2_tag3': 'Multi-currency',
    'landing.cap2_tag4': 'Server totals',
    'landing.cap3_tag1': 'Self-service',
    'landing.cap3_tag2': 'Product imagery',
    'landing.cap3_tag3': 'Live stock',
    'landing.cap3_tag4': 'Cost history',
    'landing.featured_title': 'Featured finishes',
    'landing.collections_eyebrow': 'Collections',
    'landing.collections_title': 'Browse by collection',
    'landing.materials_count': '{count} materials',
    'landing.how_eyebrow': 'How it works',
    'landing.how_title': 'From sample to specification',
    'landing.how_sub':
        'One workspace for the whole material journey — for project owners, designers and the suppliers who keep the atelier stocked.',
    'landing.step1_title': 'Browse the catalog',
    'landing.step1_body':
        'Explore curated finishes by collection, filter by material, and compare materials side by side.',
    'landing.step2_title': 'Order through invoices',
    'landing.step2_body':
        'Build orders with live line items, taxes and currency conversion — totals are always recalculated on the server.',
    'landing.step3_title': 'Track everything',
    'landing.step3_body':
        'Payments, outstanding balances, costs and profit margins — visible to the people who need them, nothing more.',
    'landing.cta_title': 'Ready to build with Decore?',
    'landing.cta_authed': 'Your workspace is one click away.',
    'landing.cta_guest':
        'Reach out to request pricing and materials, or sign in to your workspace.',

    // ---- Catalog ----
    'catalog.eyebrow': 'The atelier',
    'catalog.title': 'The catalog',
    'catalog.sub':
        'Every finish currently stocked by our partner suppliers — search by name or SKU, or narrow by collection.',
    'catalog.search_placeholder': 'Search materials…',
    'catalog.filter_label': 'Filter by classification',
    'catalog.all_collections': 'All collections',
    'catalog.empty_title': 'No materials found',
    'catalog.empty_desc': 'Try a different search, or browse another collection.',
    'catalog.prices_note':
        'Prices are shown per unit without tax. Supplier pricing and costs are available inside the workspace.',

    // ---- Public material card ----
    'pmc.from': 'From',
    'pmc.view': 'View finish',

    // ---- Pagination ----
    'pagination.showing': 'Showing {from}–{to} of {total}',
    'pagination.aria': 'Pagination',

    // ---- Material show ----
    'show.back': 'Back to catalog',
    'show.supplied_by': 'Supplied by {name}',
    'show.per_unit': 'per {unit}',
    'show.interested': 'Interested in this finish?',
    'show.quote': 'to request a quote from {supplier}.',

    // ---- Units ----
    'unit.piece': 'Piece',
    'unit.square_meter': 'm²',
    'unit.meter': 'Meter',
    'unit.box': 'Box',
    'unit.sheet': 'Sheet',

    // ---- About ----
    'about.eyebrow': 'About the atelier',
    'about.title': 'A working catalog for the materials trade.',
    'about.p1':
        'Decore is a business system built for a decoration materials shop — one place to manage suppliers, classifications, finishes, pricing, invoicing and payments. The public catalog you\'re browsing is the same live data the shop operates on: when a supplier updates a finish, this page reflects it.',
    'about.p2':
        'Behind the catalog is a full workflow: role-based workspaces for administrators, accountants, sales staff and suppliers; server-side invoice totals; historical exchange rates; cost tracking; and profit reporting — with supplier costs kept private to the people who need them.',
    'about.f1_title': 'Priced transparently',
    'about.f1_body':
        'Selling prices are shown per unit without hidden taxes. Invoices apply configured VAT rates and convert between currencies using stored exchange rates.',
    'about.f2_title': 'Costs stay private',
    'about.f2_body':
        'Supplier cost and profit data never appear on public pages — they are restricted to finance roles inside the workspace.',
    'about.f3_title': 'Built on real processes',
    'about.f3_body':
        'Drafts, issued invoices, payments, reversals and cancellations follow the rules a working shop actually depends on.',
    'about.f4_title': 'One source of truth',
    'about.f4_body':
        'Every total is recalculated and validated on the server. What you see here is the same data the dashboards and reports run on.',

    // ---- Contact ----
    'contact.eyebrow': 'Contact',
    'contact.title': 'Talk to the atelier.',
    'contact.sub':
        'Questions about a finish, a bulk order, or becoming a partner supplier? Reach out and the team will get back to you.',
    'contact.email_title': 'Email',
    'contact.email_body': 'For orders, pricing and general enquiries.',
    'contact.phone_title': 'Phone',
    'contact.phone_body': 'Talk to a sales representative directly.',
    'contact.workspace_title': 'Workspace',
    'contact.workspace_body': 'Already have an account?',
    'contact.workspace_value': 'Sign in to your workspace',
    'contact.partner_title': 'Partner with us',
    'contact.partner_body':
        'Suppliers manage their own materials and product imagery through a dedicated workspace — no phone calls or spreadsheets required. Email us to get started.',
    'contact.partner_cta': 'Email us',

    // ---- Gallery ----
    'gallery.eyebrow': 'The portfolio',
    'gallery.title': 'Our work',
    'gallery.sub':
        'Finished projects, samples and installations — browsed by collection. New work is added as the shop grows.',
    'gallery.all_sections': 'All collections',
    'gallery.empty_title': 'No work yet',
    'gallery.empty_desc': 'New gallery images will appear here soon.',
    'gallery.admin_title': 'Gallery sections',
    'gallery.admin_sub': 'Organize the public portfolio into sections, then upload the images for each one.',
    'gallery.new_section': 'New section',
    'gallery.edit_section': 'Edit section',
    'gallery.edit_section_short': 'Edit',
    'gallery.section_name_en': 'Section name (English)',
    'gallery.section_name_ar': 'Section name (Arabic)',
    'gallery.description_en': 'Description (English)',
    'gallery.description_ar': 'Description (Arabic)',
    'gallery.sort_order': 'Sort order',
    'gallery.visible': 'Visible on the public site',
    'gallery.images': '{count} images',
    'gallery.upload_images': 'Upload images',
    'gallery.upload_hint': 'JPEG, PNG or WebP — up to 8MB each. Upload one or several at once.',
    'gallery.uploading': 'Uploading…',
    'gallery.uploaded': 'Upload',
    'gallery.replace': 'Replace',
    'gallery.remove': 'Remove',
    'gallery.remove_confirm': 'Remove this image permanently?',
    'gallery.alt_text': 'Alt text',
    'gallery.delete_section': 'Delete section',
    'gallery.delete_section_confirm': 'Delete this section and all its images?',
    'gallery.back_to_gallery': 'Back to gallery',
    'gallery.lightbox_close': 'Close viewer',
    'gallery.lightbox_previous': 'Previous image',
    'gallery.lightbox_next': 'Next image',
    'gallery.lightbox_counter': '{current} of {total}',
    'gallery.lightbox_open': 'Open image',

    // ---- Integrations ----
    'integrations.title': 'Pixels & integrations',
    'integrations.sub':
        'Connect analytics and advertising tags to your public site. Managed installs render the official snippet; custom installs paste your own head/body code.',
    'integrations.enabled': 'Enabled',
    'integrations.enable': 'Enable',
    'integrations.disable': 'Disable',
    'integrations.managed': 'Managed install',
    'integrations.custom': 'Custom code',
    'integrations.managed_hint': 'Enter the tracking ID and Decore renders the official snippet.',
    'integrations.custom_hint': 'Paste your own head code (and body code where supported).',
    'integrations.head_code': 'Head code',
    'integrations.body_code': 'Body code',
    'integrations.save': 'Save settings',
    'integrations.disconnect': 'Disconnect',
    'integrations.disconnect_confirm': 'Disconnect this integration?',
    'integrations.not_configured': 'Not configured',
    'integrations.site_url': 'Site URL',
    'integrations.docs': 'Docs',
    'integrations.diagnostics': 'Diagnostics',
    'integrations.placement': 'Placement: {placement}',

    // ---- Auth ----
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.name': 'Name',
    'auth.confirm_password': 'Confirm password',
    'auth.remember_me': 'Remember me',
    'auth.forgot': 'Forgot your password?',
    'auth.sign_in': 'Sign in',
    'auth.signing_in': 'Signing in…',
    'auth.dev_accounts': 'Development accounts — admin@decore.test / password',
    'auth.forgot_intro':
        'Forgot your password? Enter your email and we will email you a password reset link.',
    'auth.email_reset_link': 'Email password reset link',
    'auth.sending': 'Sending…',
    'auth.reset_password': 'Reset password',
    'auth.resetting': 'Resetting…',
    'auth.verify_title': 'Email verification',
    'auth.verify_intro':
        'Thanks for signing up! Before getting started, could you verify your email address by clicking on the link we just emailed to you? If you didn\'t receive the email, we will gladly send you another.',
    'auth.verify_sent':
        'A new verification link has been sent to the email address you provided during registration.',
    'auth.resend': 'Resend verification email',
    'auth.confirm_intro':
        'This is a secure area of the application. Please confirm your password before continuing.',
    'auth.confirm': 'Confirm',
    'auth.confirming': 'Confirming…',

    // ---- Guest layout ----
    'guest.tagline': 'Decoration materials atelier',

    // ---- Authenticated shell ----
    'shell.skip_to_content': 'Skip to content',
    'shell.close_navigation': 'Close navigation',
    'shell.profile_settings': 'Profile settings',
    'shell.open_navigation': 'Open navigation',

    // ---- Dashboard ----
    'dash.title': 'Dashboard',
    'dash.overview': 'Overview for {from} → {to}',
    'dash.today': 'Today',
    'dash.week': 'This week',
    'dash.month': 'This month',
    'dash.year': 'This year',
    'dash.custom': 'Custom range',
    'dash.suppliers': 'Suppliers',
    'dash.materials': 'Materials',
    'dash.customers': 'Customers',
    'dash.invoices': 'Invoices',
    'dash.revenue': 'Revenue',
    'dash.payments_received': 'Payments received',
    'dash.outstanding': 'Outstanding',
    'dash.supplier_costs': 'Supplier costs',
    'dash.gross_profit': 'Gross profit',
    'dash.margin': 'Margin',
    'dash.overdue_count': '{count} overdue invoice(s)',
    'dash.due_soon': '{count} due within 7 days',
    'dash.draft_invoices': 'Draft invoices',
    'dash.issued_invoices': 'Issued invoices',
    'dash.personal_sales': 'Personal sales',
    'dash.follow_ups': 'Follow-ups',
    'dash.my_materials': 'My materials',
    'dash.active_materials': 'Active materials',
    'dash.missing_images': 'Missing images',
    'dash.revenue_by_month': 'Revenue by month',
    'dash.by_classification': 'By classification',
    'dash.by_supplier': 'By supplier',
    'dash.payments_by_month': 'Payments by month',
    'dash.recent_invoices': 'Recent invoices',
    'dash.number': 'Number',
    'dash.customer': 'Customer',
    'dash.issue_date': 'Issue date',
    'dash.total': 'Total',
    'dash.status': 'Status',
    'dash.recent_payments': 'Recent payments',
    'dash.low_stock': 'Low stock',
    'dash.top_selling': 'Top selling',
    'dash.sold': '{qty} sold',
    'dash.overdue': 'Overdue',
    'dash.due': 'due {date}',
    'dash.recently_updated': 'Recently updated materials',
    'dash.no_materials_yet': 'No materials yet',
    'dash.create_first_material': 'Create your first material to get started.',
    'dash.action_needed': 'Action needed',
    'dash.missing_images_note':
        '{count} material(s) still need a product image. Uploaded images improve your catalogue visibility.',
    'dash.recent_customers': 'Recent customers',
    'dash.individual': 'Individual',
    'dash.popular_materials': 'Popular materials',
    'dash.outstanding_follow_ups': 'Outstanding follow-ups',
    'dash.nothing_to_show': 'Nothing to show yet',
    'dash.no_data_yet': 'Your dashboard metrics will appear here once data exists.',
    'dash.visitor_analytics': 'Visitor analytics',
    'dash.visitor_analytics_sub': 'Public site traffic over the selected period.',
    'dash.visitors': 'Visitors',
    'dash.sessions': 'Sessions',
    'dash.page_views': 'Page views',
    'dash.no_analytics': 'No visitor data yet',
    'dash.no_analytics_desc': 'Visitor analytics appear here once guests browse the public site.',

    // ---- Profile ----
    'profile.title': 'Profile',
    'profile.info_title': 'Profile Information',
    'profile.info_sub': "Update your account's profile information and email address.",
    'profile.email_unverified': 'Your email address is unverified.',
    'profile.resend_link': 'Click here to re-send the verification email.',
    'profile.verification_sent': 'A new verification link has been sent to your email address.',
    'profile.update_password_title': 'Update Password',
    'profile.update_password_sub':
        'Ensure your account is using a long, random password to stay secure.',
    'profile.current_password': 'Current Password',
    'profile.new_password': 'New Password',
    'profile.confirm_new_password': 'Confirm Password',
    'profile.delete_title': 'Delete Account',
    'profile.delete_sub':
        'Once your account is deleted, all of its resources and data will be permanently deleted. Before deleting your account, please download any data or information that you wish to retain.',
    'profile.delete_confirm_title': 'Are you sure you want to delete your account?',
    'profile.delete_confirm_message':
        'Once your account is deleted, all of its resources and data will be permanently deleted. Please enter your password to confirm you would like to permanently delete your account.',
    'profile.password_placeholder': 'Password',
} as const;

export type TranslationKey = keyof typeof en;

/** Arabic translations — every key must be covered (English is the fallback). */
const ar: Record<TranslationKey, string> = {
    // ---- Global ----
    'common.open_dashboard': 'افتح لوحة التحكم',
    'common.sign_in': 'تسجيل الدخول',
    'common.save': 'حفظ',
    'common.saved': 'تم الحفظ.',
    'common.cancel': 'إلغاء',
    'common.log_out': 'تسجيل الخروج',
    'common.back': 'رجوع',
    'common.period': 'الفترة',
    'common.view_all': 'عرض الكل',

    // ---- Navigation (public) ----
    'nav.home': 'الرئيسية',
    'nav.catalog': 'الكتالوج',
    'nav.gallery': 'معرض الأعمال',
    'nav.about': 'من نحن',
    'nav.contact': 'تواصل معنا',
    'nav.language': 'اللغة',
    'nav.main': 'القائمة الرئيسية',
    'nav.footer': 'التذييل',

    // ---- Navigation (sidebar) ----
    'nav.dashboard': 'لوحة التحكم',
    'nav.users': 'المستخدمون',
    'nav.suppliers': 'الموردون',
    'nav.classifications': 'التصنيفات',
    'nav.materials': 'المواد',
    'nav.customers': 'العملاء',
    'nav.invoices': 'الفواتير',
    'nav.payments': 'المدفوعات',
    'nav.taxes': 'الضرائب',
    'nav.currencies': 'العملات',
    'nav.exchange_rates': 'أسعار الصرف',
    'nav.reports': 'التقارير',
    'nav.audit_log': 'سجل التدقيق',
    'nav.settings': 'الإعدادات',
    'nav.site_content': 'محتوى الموقع العام',
    'nav.public_profile': 'الملف الشخصي العام',
    'nav.gallery_admin': 'معرض الأعمال',
    'nav.integrations': 'البيكسلات والتكاملات',
    'nav.materials_atelier': 'استوديو المواد',
    'nav.supplier_id': 'مورد رقم {id}',
    'nav.profile_settings': 'إعدادات الملف الشخصي',
    'nav.skip_to_content': 'تخطَّ إلى المحتوى',
    'nav.toggle_navigation': 'تبديل القائمة',
    'nav.close_navigation': 'إغلاق القائمة',

    // ---- Roles ----
    'role.admin': 'مدير',
    'role.accountant': 'محاسب',
    'role.sales': 'موظف مبيعات',
    'role.supplier': 'مورد',

    // ---- Public layout ----
    'public.tagline': 'استوديو مواد الديكور',

    // ---- Appearance ----
    'theme.switch_to_light': 'التبديل إلى الوضع الفاتح',
    'theme.switch_to_dark': 'التبديل إلى الوضع الداكن',

    // ---- Floating contact buttons ----
    'fab.call': 'اتصل بنا',
    'fab.whatsapp': 'تواصل عبر واتساب',

    // ---- Landing ----
    'landing.hero_line1': 'الأسطح التي',
    'landing.hero_accent': 'تُعرّف',
    'landing.hero_line2': 'المساحة.',
    'landing.hero_sub':
        'بدائل الخشب، مظهر الرخام، ألواح الجدران، الأرضيات والبروفيلات — مختارة من موردين شركاء، بأسعار شفافة، وجاهزة لمشروعك القادم.',
    'landing.browse_catalog': 'تصفّح الكتالوج',
    'landing.hero_badge_tag': 'جديد',
    'landing.hero_badge': 'لمسات جديدة من موردين شركاء — الربع الثالث 2026',
    'landing.trust_label': 'موثوق لدى موردين شركاء',
    'landing.stat_materials': 'مواد',
    'landing.stat_classifications': 'مجموعات',
    'landing.stat_suppliers': 'موردون شركاء',
    'landing.atelier_eyebrow': 'الاستوديو',
    'landing.capabilities_eyebrow': '// الاستوديو',
    'landing.capabilities_title': 'لمسات مختارة، من البداية إلى النهاية',
    'landing.capabilities_sub':
        'مساحة عمل واحدة لرحلة المادة كاملة — انتقاء، تسعير صادق، وبوابة ذاتية للموردين الذين يزوّدون الاستوديو.',
    'landing.cap1_title': 'المواد',
    'landing.cap1_body':
        'بدائل الخشب، مظهر الرخام، ألواح الجدران، الأرضيات والبروفيلات — مباشرة من موردين شركاء، مسعّرة لكل وحدة، جاهزة لمشروعك القادم.',
    'landing.cap2_title': 'التسعير والفواتير',
    'landing.cap2_body':
        'أسعار شفافة لكل وحدة مع ضريبة قابلة للتهيئة وتحويل عملات متعدد. تُعاد حسابات كل فاتورة وتُتحقق على الخادم.',
    'landing.cap3_title': 'مساحة عمل المورد',
    'landing.cap3_body':
        'يدير الموردون كتالوجهم وصور منتجاتهم وسجل تكاليفهم عبر مساحة عمل مخصصة — دون مكالمات أو جداول.',
    'landing.cap2_tag1': 'أسعار شفافة',
    'landing.cap2_tag2': 'معدلات ضريبة',
    'landing.cap2_tag3': 'عملات متعددة',
    'landing.cap2_tag4': 'إجماليات الخادم',
    'landing.cap3_tag1': 'خدمة ذاتية',
    'landing.cap3_tag2': 'صور المنتجات',
    'landing.cap3_tag3': 'مخزون حي',
    'landing.cap3_tag4': 'سجل التكاليف',
    'landing.featured_title': 'لمسات مميزة',
    'landing.collections_eyebrow': 'المجموعات',
    'landing.collections_title': 'تصفّح حسب المجموعة',
    'landing.materials_count': '{count} مواد',
    'landing.how_eyebrow': 'كيف يعمل',
    'landing.how_title': 'من العينة إلى المواصفات',
    'landing.how_sub':
        'مساحة عمل واحدة لرحلة المادة كاملة — لأصحاب المشاريع والمصممين وللموردين الذين يزوّدون الاستوديو.',
    'landing.step1_title': 'تصفّح الكتالوج',
    'landing.step1_body':
        'استكشف اللمسات المختارة حسب المجموعة، وصفِّ حسب المادة، وقارن المواد جنبًا إلى جنب.',
    'landing.step2_title': 'اطلب عبر الفواتير',
    'landing.step2_body':
        'أنشئ الطلبات ببنود مباشرة وضرائب وتحويل عملات — تُعاد حسابات الإجماليات دائمًا على الخادم.',
    'landing.step3_title': 'تتبّع كل شيء',
    'landing.step3_body':
        'المدفوعات والأرصدة المستحقة والتكاليف وهوامش الربح — مرئية لمن يحتاجها فقط، لا أكثر.',
    'landing.cta_title': 'جاهز للبناء مع ديكور؟',
    'landing.cta_authed': 'مساحة عملك على بُعد نقرة واحدة.',
    'landing.cta_guest': 'تواصل معنا لطلب الأسعار والمواد، أو سجّل الدخول إلى مساحة عملك.',

    // ---- Catalog ----
    'catalog.eyebrow': 'الاستوديو',
    'catalog.title': 'الكتالوج',
    'catalog.sub': 'كل لمسة متوفرة حاليًا لدى موردينا الشركاء — ابحث بالاسم أو رمز SKU، أو صفِّ حسب المجموعة.',
    'catalog.search_placeholder': 'ابحث عن مواد…',
    'catalog.filter_label': 'تصفية حسب التصنيف',
    'catalog.all_collections': 'كل المجموعات',
    'catalog.empty_title': 'لا توجد مواد',
    'catalog.empty_desc': 'جرّب بحثًا مختلفًا، أو تصفّح مجموعة أخرى.',
    'catalog.prices_note':
        'تُعرض الأسعار لكل وحدة بدون ضريبة. أسعار الموردين وتكاليفهم متاحة داخل مساحة العمل.',

    // ---- Public material card ----
    'pmc.from': 'ابتداءً من',
    'pmc.view': 'عرض اللمسة',

    // ---- Pagination ----
    'pagination.showing': 'عرض {from}–{to} من {total}',
    'pagination.aria': 'التنقل بين الصفحات',

    // ---- Material show ----
    'show.back': 'العودة إلى الكتالوج',
    'show.supplied_by': 'توفّرها {name}',
    'show.per_unit': 'لكل {unit}',
    'show.interested': 'مهتم بهذه اللمسة؟',
    'show.quote': 'لطلب عرض سعر من {supplier}.',

    // ---- Units ----
    'unit.piece': 'قطعة',
    'unit.square_meter': 'م²',
    'unit.meter': 'متر',
    'unit.box': 'صندوق',
    'unit.sheet': 'لوح',

    // ---- About ----
    'about.eyebrow': 'عن الاستوديو',
    'about.title': 'كتالوج عمل لقطاع مواد الديكور.',
    'about.p1':
        'ديكور نظام أعمال مبني لمتجر مواد ديكور — مكان واحد لإدارة الموردين والتصنيفات واللمسات والأسعار والفواتير والمدفوعات. الكتالوج العام الذي تتصفحه هو نفس البيانات الحية التي يعمل بها المتجر: عندما يحدّث مورد لمسة ما، تنعكس هنا.',
    'about.p2':
        'خلف الكتالوج سير عمل كاملة: مساحات عمل حسب الأدوار للمديرين والمحاسبين وطاقم المبيعات والموردين؛ إجماليات فواتير تُحسب على الخادم؛ أسعار صرف تاريخية؛ تتبّع للتكاليف؛ وتقارير أرباح — مع إبقاء تكاليف الموردين خاصة لمن يحتاجها فقط.',
    'about.f1_title': 'أسعار شفافة',
    'about.f1_body':
        'تُعرض أسعار البيع لكل وحدة دون ضرائب خفية. تطبّق الفواتير معدلات ضريبة القيمة المضافة المُهيأة وتحوّل بين العملات باستخدام أسعار صرف مخزّنة.',
    'about.f2_title': 'التكاليف تبقى خاصة',
    'about.f2_body':
        'لا تظهر تكاليف الموردين وبيانات الأرباح أبدًا على الصفحات العامة — فهي مقيّدة بالأدوار المالية داخل مساحة العمل.',
    'about.f3_title': 'مبنية على عمليات حقيقية',
    'about.f3_body':
        'المسودات والفواتير المصدرة والمدفوعات والإلغاءات تتبع القواعد التي يعتمد عليها متجر عامل فعلًا.',
    'about.f4_title': 'مصدر واحد للحقيقة',
    'about.f4_body':
        'تُعاد حسابات كل الإجماليات وتُتحقق على الخادم. ما تراه هنا هو نفس البيانات التي تعمل بها لوحات التحكم والتقارير.',

    // ---- Contact ----
    'contact.eyebrow': 'تواصل معنا',
    'contact.title': 'تواصل مع الاستوديو.',
    'contact.sub':
        'أسئلة عن لمسة معينة، أو طلب بالجملة، أو رغبة في أن تصبح موردًا شريكًا؟ تواصل معنا وسيعود إليك الفريق.',
    'contact.email_title': 'البريد الإلكتروني',
    'contact.email_body': 'للطلبات والأسعار والاستفسارات العامة.',
    'contact.phone_title': 'الهاتف',
    'contact.phone_body': 'تحدث مباشرة مع مندوب مبيعات.',
    'contact.workspace_title': 'مساحة العمل',
    'contact.workspace_body': 'لديك حساب بالفعل؟',
    'contact.workspace_value': 'سجّل الدخول إلى مساحة عملك',
    'contact.partner_title': 'اشترك معنا',
    'contact.partner_body':
        'يدير الموردون موادهم وصور منتجاتهم عبر مساحة عمل مخصصة — دون مكالمات أو جداول. راسلنا لتبدأ.',
    'contact.partner_cta': 'راسلنا',

    // ---- Gallery ----
    'gallery.eyebrow': 'المعرض',
    'gallery.title': 'أعمالنا',
    'gallery.sub':
        'مشاريع وعينات وتركيبات منجزة — تصفّح حسب المجموعة. تُضاف أعمال جديدة مع نمو المتجر.',
    'gallery.all_sections': 'كل المجموعات',
    'gallery.empty_title': 'لا توجد أعمال بعد',
    'gallery.empty_desc': 'ستظهر صور المعرض الجديدة هنا قريبًا.',
    'gallery.admin_title': 'أقسام المعرض',
    'gallery.admin_sub': 'نظّم معرض الأعمال العام إلى أقسام، ثم ارفع صور كل قسم.',
    'gallery.new_section': 'قسم جديد',
    'gallery.edit_section': 'تعديل القسم',
    'gallery.edit_section_short': 'تعديل',
    'gallery.section_name_en': 'اسم القسم (إنجليزي)',
    'gallery.section_name_ar': 'اسم القسم (عربي)',
    'gallery.description_en': 'الوصف (إنجليزي)',
    'gallery.description_ar': 'الوصف (عربي)',
    'gallery.sort_order': 'الترتيب',
    'gallery.visible': 'ظاهر على الموقع العام',
    'gallery.images': '{count} صور',
    'gallery.upload_images': 'رفع الصور',
    'gallery.upload_hint': 'JPEG أو PNG أو WebP — حتى 8 ميجابايت للصورة. يمكن رفع أكثر من صورة دفعة واحدة.',
    'gallery.uploading': 'جارٍ الرفع…',
    'gallery.uploaded': 'رفع',
    'gallery.replace': 'استبدال',
    'gallery.remove': 'إزالة',
    'gallery.remove_confirm': 'هل تريد إزالة هذه الصورة نهائيًا؟',
    'gallery.alt_text': 'النص البديل',
    'gallery.delete_section': 'حذف القسم',
    'gallery.delete_section_confirm': 'حذف هذا القسم وكل صوره؟',
    'gallery.back_to_gallery': 'العودة إلى المعرض',
    'gallery.lightbox_close': 'إغلاق العارض',
    'gallery.lightbox_previous': 'الصورة السابقة',
    'gallery.lightbox_next': 'الصورة التالية',
    'gallery.lightbox_counter': '{current} من {total}',
    'gallery.lightbox_open': 'فتح الصورة',

    // ---- Integrations ----
    'integrations.title': 'البيكسلات والتكاملات',
    'integrations.sub':
        'اربط أدوات التحليلات والإعلانات بموقعك العام. التركيب المُدار يعرض الكود الرسمي؛ التركيب المخصص يلصق كود الرأس والجسم الخاص بك.',
    'integrations.enabled': 'مفعّل',
    'integrations.enable': 'تفعيل',
    'integrations.disable': 'تعطيل',
    'integrations.managed': 'تركيب مُدار',
    'integrations.custom': 'كود مخصص',
    'integrations.managed_hint': 'أدخل معرف التتبع وسيعرض ديكور الكود الرسمي.',
    'integrations.custom_hint': 'الصق كود الرأس الخاص بك (وكود الجسم حيثما كان مدعومًا).',
    'integrations.head_code': 'كود الرأس',
    'integrations.body_code': 'كود الجسم',
    'integrations.save': 'حفظ الإعدادات',
    'integrations.disconnect': 'قطع الاتصال',
    'integrations.disconnect_confirm': 'هل تريد قطع الاتصال بهذا التكامل؟',
    'integrations.not_configured': 'غير مكوّن',
    'integrations.site_url': 'رابط الموقع',
    'integrations.docs': 'التوثيق',
    'integrations.diagnostics': 'التشخيص',
    'integrations.placement': 'الموقع: {placement}',

    // ---- Auth ----
    'auth.email': 'البريد الإلكتروني',
    'auth.password': 'كلمة المرور',
    'auth.name': 'الاسم',
    'auth.confirm_password': 'تأكيد كلمة المرور',
    'auth.remember_me': 'تذكّرني',
    'auth.forgot': 'نسيت كلمة المرور؟',
    'auth.sign_in': 'تسجيل الدخول',
    'auth.signing_in': 'جارٍ تسجيل الدخول…',
    'auth.dev_accounts': 'حسابات التطوير — admin@decore.test / password',
    'auth.forgot_intro': 'نسيت كلمة المرور؟ أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة تعيين كلمة المرور.',
    'auth.email_reset_link': 'إرسال رابط إعادة التعيين',
    'auth.sending': 'جارٍ الإرسال…',
    'auth.reset_password': 'إعادة تعيين كلمة المرور',
    'auth.resetting': 'جارٍ إعادة التعيين…',
    'auth.verify_title': 'التحقق من البريد الإلكتروني',
    'auth.verify_intro':
        'شكرًا لتسجيلك! قبل البدء، يرجى التحقق من بريدك الإلكتروني بالضغط على الرابط الذي أرسلناه إليك. إذا لم تستلم البريد، يسعدنا إرساله مرة أخرى.',
    'auth.verify_sent': 'تم إرسال رابط تحقق جديد إلى البريد الإلكتروني الذي سجّلت به.',
    'auth.resend': 'إعادة إرسال بريد التحقق',
    'auth.confirm_intro': 'هذه منطقة آمنة من التطبيق. يرجى تأكيد كلمة المرور قبل المتابعة.',
    'auth.confirm': 'تأكيد',
    'auth.confirming': 'جارٍ التأكيد…',

    // ---- Guest layout ----
    'guest.tagline': 'استوديو مواد الديكور',

    // ---- Authenticated shell ----
    'shell.skip_to_content': 'تخطَّ إلى المحتوى',
    'shell.close_navigation': 'إغلاق القائمة',
    'shell.profile_settings': 'إعدادات الملف الشخصي',
    'shell.open_navigation': 'فتح القائمة',

    // ---- Dashboard ----
    'dash.title': 'لوحة التحكم',
    'dash.overview': 'نظرة عامة من {from} إلى {to}',
    'dash.today': 'اليوم',
    'dash.week': 'هذا الأسبوع',
    'dash.month': 'هذا الشهر',
    'dash.year': 'هذه السنة',
    'dash.custom': 'نطاق مخصص',
    'dash.suppliers': 'الموردون',
    'dash.materials': 'المواد',
    'dash.customers': 'العملاء',
    'dash.invoices': 'الفواتير',
    'dash.revenue': 'الإيرادات',
    'dash.payments_received': 'المدفوعات المستلمة',
    'dash.outstanding': 'المستحق',
    'dash.supplier_costs': 'تكاليف الموردين',
    'dash.gross_profit': 'إجمالي الربح',
    'dash.margin': 'الهامش',
    'dash.overdue_count': '{count} فواتير متأخرة',
    'dash.due_soon': '{count} مستحقة خلال 7 أيام',
    'dash.draft_invoices': 'فواتير مسودة',
    'dash.issued_invoices': 'فواتير مصدرة',
    'dash.personal_sales': 'مبيعاتي',
    'dash.follow_ups': 'متابعات',
    'dash.my_materials': 'موادي',
    'dash.active_materials': 'مواد نشطة',
    'dash.missing_images': 'صور ناقصة',
    'dash.revenue_by_month': 'الإيرادات حسب الشهر',
    'dash.by_classification': 'حسب التصنيف',
    'dash.by_supplier': 'حسب المورد',
    'dash.payments_by_month': 'المدفوعات حسب الشهر',
    'dash.recent_invoices': 'أحدث الفواتير',
    'dash.number': 'الرقم',
    'dash.customer': 'العميل',
    'dash.issue_date': 'تاريخ الإصدار',
    'dash.total': 'الإجمالي',
    'dash.status': 'الحالة',
    'dash.recent_payments': 'أحدث المدفوعات',
    'dash.low_stock': 'مخزون منخفض',
    'dash.top_selling': 'الأكثر مبيعًا',
    'dash.sold': '{qty} مباع',
    'dash.overdue': 'متأخرة',
    'dash.due': 'مستحقة {date}',
    'dash.recently_updated': 'مواد حُدّثت مؤخرًا',
    'dash.no_materials_yet': 'لا توجد مواد بعد',
    'dash.create_first_material': 'أنشئ أول مادة للبدء.',
    'dash.action_needed': 'إجراء مطلوب',
    'dash.missing_images_note':
        '{count} مادة ما زالت بحاجة إلى صورة منتج. الصور المرفوعة تحسّن ظهور كتالوجك.',
    'dash.recent_customers': 'أحدث العملاء',
    'dash.individual': 'فرد',
    'dash.popular_materials': 'المواد الشائعة',
    'dash.outstanding_follow_ups': 'متابعات مستحقة',
    'dash.nothing_to_show': 'لا يوجد شيء لعرضه بعد',
    'dash.no_data_yet': 'ستظهر مقاييس لوحة التحكم هنا بمجرد توفر البيانات.',
    'dash.visitor_analytics': 'تحليلات الزوار',
    'dash.visitor_analytics_sub': 'حركة الموقع العام خلال الفترة المحددة.',
    'dash.visitors': 'الزوار',
    'dash.sessions': 'الجلسات',
    'dash.page_views': 'مشاهدات الصفحات',
    'dash.no_analytics': 'لا توجد بيانات زوار بعد',
    'dash.no_analytics_desc': 'ستظهر تحليلات الزوار بمجرد تصفح الضيوف للموقع العام.',

    // ---- Profile ----
    'profile.title': 'الملف الشخصي',
    'profile.info_title': 'معلومات الملف الشخصي',
    'profile.info_sub': 'حدّث معلومات ملفك الشخصي وعنوان بريدك الإلكتروني.',
    'profile.email_unverified': 'بريدك الإلكتروني غير مُتحقق.',
    'profile.resend_link': 'اضغط هنا لإعادة إرسال بريد التحقق.',
    'profile.verification_sent': 'تم إرسال رابط تحقق جديد إلى بريدك الإلكتروني.',
    'profile.update_password_title': 'تحديث كلمة المرور',
    'profile.update_password_sub': 'تأكد من استخدام كلمة مرور طويلة وعشوائية للحفاظ على أمان حسابك.',
    'profile.current_password': 'كلمة المرور الحالية',
    'profile.new_password': 'كلمة المرور الجديدة',
    'profile.confirm_new_password': 'تأكيد كلمة المرور الجديدة',
    'profile.delete_title': 'حذف الحساب',
    'profile.delete_sub':
        'بمجرد حذف حسابك، ستُحذف جميع موارده وبياناته نهائيًا. قبل الحذف، يرجى تنزيل أي بيانات ترغب في الاحتفاظ بها.',
    'profile.delete_confirm_title': 'هل أنت متأكد من رغبتك في حذف حسابك؟',
    'profile.delete_confirm_message':
        'بمجرد حذف حسابك، ستُحذف جميع موارده وبياناته نهائيًا. أدخل كلمة المرور لتأكيد الحذف النهائي لحسابك.',
    'profile.password_placeholder': 'كلمة المرور',
};

const dictionaries: Record<Locale, Record<TranslationKey, string>> = { en, ar };

export interface TranslateParams {
    [key: string]: string | number;
}

/**
 * Admin-editable overrides keyed by translation key. A non-empty stored value
 * replaces the dictionary default for that locale; empty/null falls back.
 */
export type ContentOverrides = Record<string, { en?: string | null; ar?: string | null }>;

/** Resolve a key for a locale with {param} interpolation, falling back to English. */
export function translate(
    locale: Locale,
    key: TranslationKey,
    params?: TranslateParams,
    overrides?: ContentOverrides,
): string {
    const stored = overrides?.[key]?.[locale];
    let text: string =
        stored !== undefined && stored !== null && stored.trim() !== ''
            ? stored
            : dictionaries[locale]?.[key] ?? en[key] ?? key;

    if (params) {
        for (const [name, value] of Object.entries(params)) {
            text = text.replaceAll(`{${name}}`, String(value));
        }
    }

    return text;
}

export function isRtl(locale: Locale): boolean {
    return locale === 'ar';
}

/**
 * Map a server role value to its translation key. The enum value for sales
 * staff is `sales_staff` while the dictionary key is `role.sales` — never
 * interpolate the raw role into a key.
 */
const ROLE_KEYS: Record<string, TranslationKey> = {
    admin: 'role.admin',
    accountant: 'role.accountant',
    sales_staff: 'role.sales',
    supplier: 'role.supplier',
};

export function roleKey(role: string | undefined | null): TranslationKey {
    return (role && ROLE_KEYS[role]) || 'role.supplier';
}

interface I18nContextValue {
    locale: Locale;
    dir: 'ltr' | 'rtl';
    t: (key: TranslationKey, params?: TranslateParams) => string;
    switchLocale: (next: Locale) => void;
    /** Raw admin-editable overrides (empty string = use code default). */
    overrides: ContentOverrides;
}

const I18nContext = createContext<I18nContextValue | null>(null);

/**
 * Wraps the Inertia app. This provider intentionally sits ABOVE the Inertia
 * `<App />` component, so it cannot call `usePage()` (that hook throws outside
 * the Inertia context). Instead it receives the initial locale from the first
 * page load and follows every subsequent navigation through the documented
 * Inertia `success` event, which carries the new page's props. Keeps the
 * document's `lang`/`dir` attributes in sync with the active locale.
 */
export function LocaleProvider({
    initialLocale,
    initialContent,
    children,
}: {
    initialLocale: Locale;
    initialContent: ContentOverrides;
    children: ReactNode;
}) {
    const [locale, setLocale] = useState<Locale>(initialLocale);
    const [overrides, setOverrides] = useState<ContentOverrides>(initialContent);
    const dir: 'ltr' | 'rtl' = isRtl(locale) ? 'rtl' : 'ltr';

    useEffect(() => {
        document.documentElement.lang = locale;
        document.documentElement.dir = dir;
    }, [locale, dir]);

    // Track the shared `locale` and `site_content` props after every visit
    // (including the redirect back from a locale switch). Setting the same
    // value is a no-op, so subscribing once is safe.
    useEffect(() => {
        return router.on('success', (event) => {
            const props = event.detail.page.props;
            const nextLocale = props.locale as Locale | undefined;
            if (typeof nextLocale === 'string') {
                setLocale(nextLocale);
            }
            const nextContent = props.site_content as ContentOverrides | undefined;
            if (nextContent && typeof nextContent === 'object') {
                setOverrides(nextContent);
            }
        });
    }, []);

    const t = (key: TranslationKey, params?: TranslateParams) => translate(locale, key, params, overrides);

    const switchLocale = (next: Locale) => {
        if (next === locale) return;
        // Server persists the cookie and redirects back to the current page;
        // the follow-up `success` event updates the locale here.
        router.post(route('locale.update', next), {}, { preserveScroll: true });
    };

    return (
        <I18nContext.Provider value={{ locale, dir, t, switchLocale, overrides }}>
            {children}
        </I18nContext.Provider>
    );
}

export function useI18n(): I18nContextValue {
    const ctx = useContext(I18nContext);
    if (!ctx) throw new Error('useI18n must be used within LocaleProvider');
    return ctx;
}
