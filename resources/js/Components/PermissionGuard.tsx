import { usePage } from '@inertiajs/react';
import type { PropsWithChildren, ReactNode } from 'react';
import type { Permissions } from '@/types/domain';

interface PermissionGuardProps {
    permission: keyof Permissions;
    fallback?: ReactNode;
}

/**
 * Presentation-only guard: hides UI for users without the permission.
 * Server policies remain the authoritative enforcement.
 */
export default function PermissionGuard({
    permission,
    fallback = null,
    children,
}: PropsWithChildren<PermissionGuardProps>) {
    const { permissions } = usePage().props;

    if (!permissions || !permissions[permission]) return <>{fallback}</>;

    return <>{children}</>;
}
