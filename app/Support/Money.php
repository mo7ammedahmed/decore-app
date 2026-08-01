<?php

namespace App\Support;

/**
 * Decimal math helpers.
 *
 * All financial calculations go through this class so rounding is consistent
 * across services. Values are kept as decimal strings and rounded half-up
 * (away from zero) to the configured scale using integer arithmetic on top of
 * bcmath when available, falling back to PHP float math otherwise.
 */
final class Money
{
    /**
     * Round half-away-from-zero to the given scale.
     */
    public static function round(string|int|float $value, int $scale = 2): string
    {
        $value = (string) $value;

        if (function_exists('bcadd')) {
            $factor = bcpow('10', (string) $scale);

            $negative = bccomp($value, '0') < 0;

            // Work with the absolute value scaled by the factor.
            $abs = $negative ? bcmul($value, '-1', $scale + 4) : $value;
            $scaled = bcmul($abs, $factor, $scale + 4);

            // Add 0.5 then truncate to an integer (floor for positives).
            $integer = bcadd($scaled, '0.5', 0);
            $integer = $negative ? bcmul($integer, '-1', 0) : $integer;

            return bcdiv($integer, $factor, $scale);
        }

        return number_format(round((float) $value, $scale, PHP_ROUND_HALF_UP), $scale, '.', '');
    }

    /**
     * Round half-up to a whole number (used for percentages).
     */
    public static function roundInt(string|int|float $value): int
    {
        return (int) self::round($value, 0);
    }

    public static function add(string|int|float $a, string|int|float $b, int $scale = 2): string
    {
        if (function_exists('bcadd')) {
            return self::round(bcadd((string) $a, (string) $b, $scale + 4), $scale);
        }

        return number_format((float) $a + (float) $b, $scale, '.', '');
    }

    public static function sub(string|int|float $a, string|int|float $b, int $scale = 2): string
    {
        if (function_exists('bcsub')) {
            return self::round(bcsub((string) $a, (string) $b, $scale + 4), $scale);
        }

        return number_format((float) $a - (float) $b, $scale, '.', '');
    }

    public static function mul(string|int|float $a, string|int|float $b, int $scale = 2): string
    {
        if (function_exists('bcmul')) {
            return self::round(bcmul((string) $a, (string) $b, $scale + 4), $scale);
        }

        return number_format((float) $a * (float) $b, $scale, '.', '');
    }

    public static function div(string|int|float $a, string|int|float $b, int $scale = 2): string
    {
        if ((float) $b == 0.0) {
            return number_format(0, $scale, '.', '');
        }

        if (function_exists('bcdiv')) {
            return self::round(bcdiv((string) $a, (string) $b, $scale + 4), $scale);
        }

        return number_format((float) $a / (float) $b, $scale, '.', '');
    }

    public static function gte(string|int|float $a, string|int|float $b): bool
    {
        return (float) $a >= (float) $b;
    }

    public static function gt(string|int|float $a, string|int|float $b): bool
    {
        return (float) $a > (float) $b;
    }

    public static function lt(string|int|float $a, string|int|float $b): bool
    {
        return (float) $a < (float) $b;
    }

    /**
     * Locale-formatted string (for display only).
     */
    public static function format(string|int|float $value, int $scale = 2): string
    {
        return number_format((float) self::round($value, $scale), $scale, '.', ',');
    }
}
