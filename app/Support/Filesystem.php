<?php

namespace App\Support;

/**
 * Filesystem configuration helpers.
 *
 * Keeps the "which disk is active" decision in one pure, testable place so
 * the rest of the app can rely on `config('filesystems.default')` without
 * worrying about whether S3 is actually configured.
 */
final class Filesystem
{
    /**
     * Resolve the effective default filesystem disk.
     *
     * When `FILESYSTEM_DISK=s3` but the required AWS credentials are missing,
     * fall back to the local public disk so the application keeps working on
     * machines without S3 configured (fresh clones, local development, CI).
     *
     * @param  string|null  $requested  Value of FILESYSTEM_DISK (null = unset).
     */
    public static function resolveDefaultDisk(
        ?string $requested,
        ?string $awsKey,
        ?string $awsSecret,
        ?string $awsBucket,
    ): string {
        if ($requested === 's3' && (blank($awsKey) || blank($awsSecret) || blank($awsBucket))) {
            return 'public';
        }

        // An unset or empty FILESYSTEM_DISK means the framework default.
        return blank($requested) ? 'local' : $requested;
    }
}
