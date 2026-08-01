import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
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
