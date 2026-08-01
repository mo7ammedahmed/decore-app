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
    'nav.sidebar_label': 'Sidebar Navigation',

    // ---- Roles ----
    'role.admin': 'Administrator',
    'role.accountant': 'Accountant',
    'role.sales': 'Sales Staff',
    'role.supplier': 'Supplier',

    // ---- Public layout ----
    'public.tagline': 'Decoration materials showroom',

    // ---- Public header & footer ----
    'header.explore_materials': 'Explore materials',
    'footer.collections': 'Collections',
    'footer.explore': 'Explore',
    'footer.contact': 'Contact',
    'footer.follow': 'Follow us',
    'footer.rights': 'All rights reserved.',
    'footer.staff_sign_in': 'Staff sign in',
    'footer.working_hours': 'Working hours',

    // ---- Appearance ----
    'theme.switch_to_light': 'Switch to light mode',
    'theme.switch_to_dark': 'Switch to dark mode',

    // ---- Floating contact buttons ----
    'fab.call': 'Call us',
    'fab.whatsapp': 'Chat on WhatsApp',

    // ---- Landing ----
    'landing.hero_kicker': 'Decorative materials showroom',
    'landing.hero_line1': 'Materials that',
    'landing.hero_accent': 'transform',
    'landing.hero_line2': 'ordinary spaces.',
    'landing.hero_sub':
        'Wood alternatives, marble looks, wall panels, flooring and decorative profiles — curated from trusted suppliers for homes and commercial projects.',
    'landing.hero_cta_catalog': 'Explore materials',
    'landing.hero_cta_gallery': 'View our projects',
    'landing.trust_label': 'Curated finishes, trusted suppliers',
    'landing.stat_materials': 'Materials',
    'landing.stat_classifications': 'Collections',
    'landing.stat_suppliers': 'Partner suppliers',
    'landing.collections_eyebrow': 'Collections',
    'landing.collections_title': 'Shop by collection',
    'landing.collections_sub':
        'Browse finishes the way you would in a showroom — by family of materials.',
    'landing.materials_count': '{count} materials',
    'landing.featured_eyebrow': 'Featured',
    'landing.featured_title': 'Featured finishes',
    'landing.featured_sub':
        'A curated selection of finishes our partners stock right now.',
    'landing.inspiration_eyebrow': 'Projects',
    'landing.inspiration_title': 'Spaces shaped by our materials',
    'landing.inspiration_sub':
        'Finished interiors, installations and material close-ups from our portfolio.',
    'landing.inspiration_cta': 'View the full gallery',
    'landing.why_eyebrow': 'Why Decore',
    'landing.why_title': 'Choosing the right finish, made easy',
    'landing.why_sub':
        'A decoration shop built around the way people actually choose materials — by seeing, comparing and asking.',
    'landing.why_1_title': 'Curated finishes',
    'landing.why_1_body':
        'Every material is selected for quality and how it looks in a real space — never just to fill a shelf.',
    'landing.why_2_title': 'Trusted suppliers',
    'landing.why_2_body':
        'We work with established material suppliers and stand behind what we recommend.',
    'landing.why_3_title': 'Transparent information',
    'landing.why_3_body':
        'Clear per-unit pricing, honest descriptions and real product photography.',
    'landing.why_4_title': 'Selection support',
    'landing.why_4_body':
        'Tell us about your project and we will help you match the right finishes to your space and budget.',
    'landing.why_5_title': 'Residential & commercial',
    'landing.why_5_body':
        'From single rooms to full fit-outs — for homeowners, designers, contractors and architects.',
    'landing.why_6_title': 'Direct quotations',
    'landing.why_6_body':
        'Request a quote in one message — by phone, email or WhatsApp.',
    'landing.journey_eyebrow': 'How it works',
    'landing.journey_title': 'From discovery to decision',
    'landing.journey_sub': 'Four simple steps from browsing to a finished space.',
    'landing.step1_title': 'Discover materials',
    'landing.step1_body': 'Browse the catalog and collections at your own pace.',
    'landing.step2_title': 'Compare finishes',
    'landing.step2_body':
        'Review samples, prices and specifications side by side.',
    'landing.step3_title': 'Contact the team',
    'landing.step3_body':
        'Ask questions or request a quote — by phone, email or WhatsApp.',
    'landing.step4_title': 'Confirm your requirements',
    'landing.step4_body':
        'Share your project details and we will prepare the final list.',
    'landing.cta_title': 'Ready to transform your space?',
    'landing.cta_sub':
        'Browse the catalog, explore our projects, or talk to the team about your next project.',
    'landing.cta_catalog': 'Browse the catalog',
    'landing.cta_gallery': 'View our projects',
    'landing.cta_whatsapp': 'Chat on WhatsApp',
    'landing.cta_contact': 'Contact the team',

    // ---- Catalog ----
    'catalog.eyebrow': 'The collection',
    'catalog.title': 'The catalog',
    'catalog.sub':
        'Every finish currently stocked by our partner suppliers — search by name or SKU, or narrow by collection.',
    'catalog.search_placeholder': 'Search materials…',
    'catalog.filter_label': 'Filter by collection',
    'catalog.all_collections': 'All collections',
    'catalog.results_count': '{count} finishes',
    'catalog.clear': 'Clear',
    'catalog.empty_title': 'No materials found',
    'catalog.empty_desc': 'Try a different search, or browse another collection.',

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
    'show.breadcrumb_home': 'Home',
    'show.breadcrumb_catalog': 'Catalog',
    'show.overview_label': 'About this finish',
    'show.collection_label': 'Collection',
    'show.sku_label': 'SKU',
    'show.quote_cta': 'Request a quote',
    'show.whatsapp_cta': 'Ask on WhatsApp',
    'show.related_title': 'You may also like',
    'show.related_sub': 'More finishes from this collection.',

    // ---- Units ----
    'unit.piece': 'Piece',
    'unit.square_meter': 'm²',
    'unit.meter': 'Meter',
    'unit.box': 'Box',
    'unit.sheet': 'Sheet',

    // ---- About ----
    'about.eyebrow': 'About us',
    'about.title': 'A showroom of finishes, built on trust.',
    'about.lead':
        'Decore is a decoration materials shop for homes and commercial spaces. We curate wood alternatives, marble looks, wall panels, flooring and decorative profiles from trusted suppliers — and help you choose the right finish for every room.',
    'about.what_title': 'What we offer',
    'about.what_1_title': 'Curated materials',
    'about.what_1_body':
        'A focused range of finishes chosen for quality and performance — from wood alternatives to marble looks, panels, flooring and profiles.',
    'about.what_2_title': 'Honest product information',
    'about.what_2_body':
        'Real photography, clear specifications and per-unit pricing so you can compare finishes with confidence.',
    'about.what_3_title': 'Project support',
    'about.what_3_body':
        'From a single sample to a full fit-out — our team helps you select, estimate and confirm the right materials.',
    'about.who_title': 'Who we serve',
    'about.who_1_title': 'Homeowners',
    'about.who_1_body': 'Refreshing a room or a whole home with finishes that last.',
    'about.who_2_title': 'Interior designers',
    'about.who_2_body': 'Reliable materials and quick answers for client projects.',
    'about.who_3_title': 'Contractors & builders',
    'about.who_3_body': 'Consistent supply for commercial and residential builds.',
    'about.who_4_title': 'Architects',
    'about.who_4_body': 'Specification-ready finishes with honest pricing.',
    'about.suppliers_title': 'Trusted suppliers',
    'about.suppliers_body':
        'We work with established material suppliers and keep our catalog live from their listings — so the finish you see is the finish we can deliver.',
    'about.cta_title': 'Ready to start your project?',
    'about.cta_body':
        'Browse the catalog or get in touch — we are happy to help you choose.',

    // ---- Contact ----
    'contact.eyebrow': 'Contact',
    'contact.title': 'Let\'s talk about your project.',
    'contact.sub':
        'Questions about a finish, a bulk order, or a full fit-out? The team is one message away.',
    'contact.whatsapp_title': 'WhatsApp',
    'contact.whatsapp_body': 'The fastest way to reach the sales team.',
    'contact.email_title': 'Email',
    'contact.email_body': 'For orders, pricing and general enquiries.',
    'contact.phone_title': 'Phone',
    'contact.phone_body': 'Talk to a sales representative directly.',
    'contact.address_title': 'Showroom',
    'contact.address_body': 'Visit us to see and touch the finishes in person.',
    'contact.hours_title': 'Working hours',
    'contact.hours_value': 'Saturday – Thursday · 9:00 – 18:00',
    'contact.enquiry_title': 'General enquiries',
    'contact.enquiry_body':
        'Tell us what you are planning and we will guide you to the right materials and quantities.',
    'contact.quote_cta': 'Email us your enquiry',
    'contact.staff_sign_in': 'Staff & suppliers — sign in',

    // ---- Gallery ----
    'gallery.eyebrow': 'The portfolio',
    'gallery.title': 'Our projects',
    'gallery.sub':
        'Finished interiors, installations and material close-ups — browsed by collection.',
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
    'dash.quick_management': 'Quick Management',
    'dash.manage_website_elements': 'Manage website elements',
    'dash.select_action': 'Select action',
    'dash.site_content': 'Site content',
    'dash.integrations': 'Integrations',
    'dash.shop_settings': 'Shop settings',
    'dash.user_management': 'User management',
    'dash.materials_management': 'Materials management',
    'dash.quick_management_desc': 'Quick access to manage website elements and connected items',

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
    'nav.sidebar_label': 'توجيه الشريط الجانبي',

    // ---- Roles ----
    'role.admin': 'مدير',
    'role.accountant': 'محاسب',
    'role.sales': 'موظف مبيعات',
    'role.supplier': 'مورد',

    // ---- Public layout ----
    'public.tagline': 'صالة عرض مواد الديكور',

    // ---- Public header & footer ----
    'header.explore_materials': 'استكشف المواد',
    'footer.collections': 'المجموعات',
    'footer.explore': 'استكشف',
    'footer.contact': 'تواصل معنا',
    'footer.follow': 'تابعنا',
    'footer.rights': 'جميع الحقوق محفوظة.',
    'footer.staff_sign_in': 'تسجيل دخول الموظفين',
    'footer.working_hours': 'ساعات العمل',

    // ---- Appearance ----
    'theme.switch_to_light': 'التبديل إلى الوضع الفاتح',
    'theme.switch_to_dark': 'التبديل إلى الوضع الداكن',

    // ---- Floating contact buttons ----
    'fab.call': 'اتصل بنا',
    'fab.whatsapp': 'تواصل عبر واتساب',

    // ---- Landing ----
    'landing.hero_kicker': 'صالة عرض مواد الديكور',
    'landing.hero_line1': 'مواد تحوّل',
    'landing.hero_accent': 'المساحات',
    'landing.hero_line2': 'العادية.',
    'landing.hero_sub':
        'بدائل الخشب ومظهر الرخام وألواح الجدران والأرضيات والبروفيلات الزخرفية — مختارة من موردين موثوقين للمنازل والمشاريع التجارية.',
    'landing.hero_cta_catalog': 'استكشف المواد',
    'landing.hero_cta_gallery': 'شاهد أعمالنا',
    'landing.trust_label': 'لمسات منتقاة، موردون موثوقون',
    'landing.stat_materials': 'مواد',
    'landing.stat_classifications': 'مجموعات',
    'landing.stat_suppliers': 'موردون شركاء',
    'landing.collections_eyebrow': 'المجموعات',
    'landing.collections_title': 'تسوّق حسب المجموعة',
    'landing.collections_sub':
        'تصفّح اللمسات كما لو كنت في صالة عرض — حسب عائلة المواد.',
    'landing.materials_count': '{count} مواد',
    'landing.featured_eyebrow': 'مميز',
    'landing.featured_title': 'لمسات مميزة',
    'landing.featured_sub': 'تشكيلة منتقاة من اللمسات المتوفرة لدى شركائنا الآن.',
    'landing.inspiration_eyebrow': 'مشاريع',
    'landing.inspiration_title': 'مساحات صاغتها موادنا',
    'landing.inspiration_sub': 'تصميمات داخلية منجزة وتركيبات ولقطات قريبة للمواد من أعمالنا.',
    'landing.inspiration_cta': 'شاهد المعرض كاملًا',
    'landing.why_eyebrow': 'لماذا ديكور',
    'landing.why_title': 'اختيار اللمسة المناسبة أصبح سهلاً',
    'landing.why_sub': 'متجر ديكور مبني على طريقة الناس الفعلية في اختيار المواد — بالرؤية والمقارنة والسؤال.',
    'landing.why_1_title': 'لمسات منتقاة',
    'landing.why_1_body': 'كل مادة تُختار لجودتها وشكلها في مساحة حقيقية — لا لمجرد ملء الرف.',
    'landing.why_2_title': 'موردون موثوقون',
    'landing.why_2_body': 'نتعامل مع موردين راسخين لمواد الديكور ونقف خلف ما نوصي به.',
    'landing.why_3_title': 'معلومات شفافة',
    'landing.why_3_body': 'أسعار واضحة لكل وحدة، أوصاف صادقة، وصور حقيقية للمنتجات.',
    'landing.why_4_title': 'دعم في الاختيار',
    'landing.why_4_body': 'أخبرنا عن مشروعك وسنساعدك على اختيار اللمسات المناسبة لمساحتك وميزانيتك.',
    'landing.why_5_title': 'سكني وتجاري',
    'landing.why_5_body': 'من غرفة واحدة إلى تشطيب كامل — لأصحاب المنازل والمصممين والمقاولين والمهندسين المعماريين.',
    'landing.why_6_title': 'عروض أسعار مباشرة',
    'landing.why_6_body': 'اطلب عرض سعر برسالة واحدة — عبر الهاتف أو البريد أو واتساب.',
    'landing.journey_eyebrow': 'كيف نعمل',
    'landing.journey_title': 'من الاكتشاف إلى القرار',
    'landing.journey_sub': 'أربع خطوات بسيطة من التصفّح إلى مساحة منجزة.',
    'landing.step1_title': 'اكتشف المواد',
    'landing.step1_body': 'تصفّح الكتالوج والمجموعات في وقتك الخاص.',
    'landing.step2_title': 'قارن اللمسات',
    'landing.step2_body': 'راجع العينات والأسعار والمواصفات جنبًا إلى جنب.',
    'landing.step3_title': 'تواصل مع الفريق',
    'landing.step3_body': 'اطرح أسئلتك أو اطلب عرض سعر — عبر الهاتف أو البريد أو واتساب.',
    'landing.step4_title': 'أكّد متطلباتك',
    'landing.step4_body': 'شارك تفاصيل مشروعك وسنُعدّ القائمة النهائية.',
    'landing.cta_title': 'جاهز لتحويل مساحتك؟',
    'landing.cta_sub': 'تصفّح الكتالوج، استكشف مشاريعنا، أو تحدث مع الفريق عن مشروعك القادم.',
    'landing.cta_catalog': 'تصفّح الكتالوج',
    'landing.cta_gallery': 'شاهد أعمالنا',
    'landing.cta_whatsapp': 'تحدث عبر واتساب',
    'landing.cta_contact': 'تواصل مع الفريق',

    // ---- Catalog ----
    'catalog.eyebrow': 'المجموعة',
    'catalog.title': 'الكتالوج',
    'catalog.sub': 'كل لمسة متوفرة حاليًا لدى موردينا الشركاء — ابحث بالاسم أو رمز SKU، أو صفِّ حسب المجموعة.',
    'catalog.search_placeholder': 'ابحث عن مواد…',
    'catalog.filter_label': 'تصفية حسب المجموعة',
    'catalog.all_collections': 'كل المجموعات',
    'catalog.results_count': '{count} لمسة',
    'catalog.clear': 'مسح',
    'catalog.empty_title': 'لا توجد مواد',
    'catalog.empty_desc': 'جرّب بحثًا مختلفًا، أو تصفّح مجموعة أخرى.',

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
    'show.breadcrumb_home': 'الرئيسية',
    'show.breadcrumb_catalog': 'الكتالوج',
    'show.overview_label': 'عن هذه اللمسة',
    'show.collection_label': 'المجموعة',
    'show.sku_label': 'رمز SKU',
    'show.quote_cta': 'اطلب عرض سعر',
    'show.whatsapp_cta': 'اسأل عبر واتساب',
    'show.related_title': 'قد يعجبك أيضًا',
    'show.related_sub': 'لمسات أخرى من هذه المجموعة.',

    // ---- Units ----
    'unit.piece': 'قطعة',
    'unit.square_meter': 'م²',
    'unit.meter': 'متر',
    'unit.box': 'صندوق',
    'unit.sheet': 'لوح',    // ---- About ----
    'about.eyebrow': 'من نحن',
    'about.title': 'صالة عرض من اللمسات، مبنية على الثقة.',
    'about.lead':
        'ديكور متجر مواد ديكور للمنازل والمساحات التجارية. ننتقي بدائل الخشب ومظهر الرخام وألواح الجدران والأرضيات والبروفيلات الزخرفية من موردين موثوقين — ونساعدك على اختيار اللمسة المناسبة لكل غرفة.',
    'about.what_title': 'ماذا نقدم',
    'about.what_1_title': 'مواد منتقاة',
    'about.what_1_body':
        'تشكيلة مركّزة من اللمسات المختارة للجودة والأداء — من بدائل الخشب إلى مظهر الرخام والألواح والأرضيات والبروفيلات.',
    'about.what_2_title': 'معلومات صادقة عن المنتج',
    'about.what_2_body': 'صور حقيقية ومواصفات واضحة وأسعار لكل وحدة لتقارن اللمسات بثقة.',
    'about.what_3_title': 'دعم المشاريع',
    'about.what_3_body': 'من عينة واحدة إلى تشطيب كامل — يساعدك فريقنا على الاختيار والتقدير والتأكيد.',
    'about.who_title': 'لمن نخدم',
    'about.who_1_title': 'أصحاب المنازل',
    'about.who_1_body': 'تجديد غرفة أو منزل كامل بلمسات تدوم.',
    'about.who_2_title': 'مصممو الديكور',
    'about.who_2_body': 'مواد موثوقة وإجابات سريعة لمشاريع العملاء.',
    'about.who_3_title': 'المقاولون والبناؤون',
    'about.who_3_body': 'توريد ثابت للمشاريع التجارية والسكنية.',
    'about.who_4_title': 'المهندسون المعماريون',
    'about.who_4_body': 'لمسات جاهزة للمواصفات بأسعار صادقة.',
    'about.suppliers_title': 'موردون موثوقون',
    'about.suppliers_body':
        'نتعامل مع موردين راسخين لمواد الديكور ونحدّث كتالوجنا مباشرة من قوائمهم — فاللمسة التي تراها هي التي يمكننا توفيرها.',
    'about.cta_title': 'جاهز لبدء مشروعك؟',
    'about.cta_body': 'تصفّح الكتالوج أو تواصل معنا — يسعدنا مساعدتك في الاختيار.',

    // ---- Contact ----
    'contact.eyebrow': 'تواصل معنا',
    'contact.title': 'لنتحدث عن مشروعك.',
    'contact.sub':
        'أسئلة عن لمسة معينة، أو طلب بالجملة، أو تشطيب كامل؟ الفريق على بُعد رسالة واحدة.',
    'contact.whatsapp_title': 'واتساب',
    'contact.whatsapp_body': 'أسرع طريقة للوصول إلى فريق المبيعات.',
    'contact.email_title': 'البريد الإلكتروني',
    'contact.email_body': 'للطلبات والأسعار والاستفسارات العامة.',
    'contact.phone_title': 'الهاتف',
    'contact.phone_body': 'تحدث مباشرة مع مندوب مبيعات.',
    'contact.address_title': 'صالة العرض',
    'contact.address_body': 'زرنا لترى اللمسات وتلمسها بنفسك.',
    'contact.hours_title': 'ساعات العمل',
    'contact.hours_value': 'السبت – الخميس · 9:00 – 18:00',
    'contact.enquiry_title': 'استفسارات عامة',
    'contact.enquiry_body':
        'أخبرنا بما تخطط له وسنرشدك إلى المواد والكميات المناسبة.',
    'contact.quote_cta': 'راسلنا باستفسارك',
    'contact.staff_sign_in': 'الموظفون والموردون — تسجيل الدخول',

    // ---- Gallery ----
    'gallery.eyebrow': 'المعرض',
    'gallery.title': 'مشاريعنا',
    'gallery.sub':
        'تصميمات داخلية منجزة وتركيبات ولقطات قريبة للمواد — تصفّح حسب المجموعة.',
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
    'dash.quick_management': 'إدارة سريعة',
    'dash.manage_website_elements': 'إدارة عناصر الموقع',
    'dash.select_action': 'اختر إجراء',
    'dash.site_content': 'محتوى الموقع',
    'dash.integrations': 'التكاملات',
    'dash.shop_settings': 'إعدادات المتجر',
    'dash.user_management': 'إدارة المستخدمين',
    'dash.materials_management': 'إدارة المواد',
    'dash.quick_management_desc': 'الوصول السريع لإدارة عناصر الموقع والعناصر المتصلة',

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
