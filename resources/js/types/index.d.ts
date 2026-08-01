import type { AuthUser, Flash, Permissions, ShopSettings } from './domain';

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: AuthUser | null;
    };
    flash: Flash;
    permissions: Permissions | null;
    /** Active application locale (persisted server-side in a cookie). */
    locale: string;
    /** code => native name, mirroring config/app.php → available_locales. */
    availableLocales: Record<string, string>;
    /** Editable brand identity shared with every page (guests included). */
    shop?: ShopSettings | null;
    /** Active classification links for the public header/footer navigation. */
    public_collections?: { id: number; name_en: string; name_ar?: string | null; localized_name?: string; slug: string }[];
};
