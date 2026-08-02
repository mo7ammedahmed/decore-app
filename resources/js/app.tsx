import '../css/app.css';
import './bootstrap';

import { createInertiaApp, router } from '@inertiajs/react';
import { MotionConfig } from 'framer-motion';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { LocaleProvider } from '@/Utilities/i18n';
import type { ContentOverrides, Locale } from '@/Utilities/i18n';
import { initializeVisitorAnalytics } from '@/Utilities/visitorAnalytics';

const appName = import.meta.env.VITE_APP_NAME || 'Decore';

createInertiaApp({
    title: (title) => (title ? `${title} — ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.tsx`,
            import.meta.glob('./Pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);
        const initialLocale = (props.initialPage.props.locale as Locale | undefined) ?? 'en';
        const initialContent = (props.initialPage.props.site_content as ContentOverrides | undefined) ?? {};

        root.render(
            <MotionConfig reducedMotion="user">
                <LocaleProvider initialLocale={initialLocale} initialContent={initialContent}>
                    <App {...props} />
                </LocaleProvider>
            </MotionConfig>,
        );
    },
    progress: {
        color: '#d4af7a',
    },
});

// Public-site visitor analytics beacon (skips admin pages internally).
initializeVisitorAnalytics();

// Safety net: if a stale CSRF token ever reaches the client as a raw 419
// (e.g. the server exception handler couldn't run), bounce to the login page
// instead of a dead-end "Page Expired" modal. The server normally redirects
// with a bilingual flash message; this only catches the residual cases.
router.on('invalid', (event) => {
    const status = event.detail.response?.status;
    if (status === 419) {
        event.preventDefault();
        window.location.assign('/login');
    }
});
