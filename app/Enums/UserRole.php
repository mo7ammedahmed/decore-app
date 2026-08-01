<?php

namespace App\Enums;

enum UserRole: string
{
    case Admin = 'admin';
    case Accountant = 'accountant';
    case SalesStaff = 'sales_staff';
    case Supplier = 'supplier';

    /**
     * Human readable label.
     */
    public function label(): string
    {
        return match ($this) {
            self::Admin => 'Admin',
            self::Accountant => 'Accountant',
            self::SalesStaff => 'Sales Staff',
            self::Supplier => 'Supplier',
        };
    }

    /**
     * Roles that can view or manage sensitive financial data.
     */
    public function canSeeFinancialData(): bool
    {
        return in_array($this, [self::Admin, self::Accountant], true);
    }

    /**
     * Roles that may manage supplier cost data.
     */
    public function canManageCosts(): bool
    {
        return $this === self::Admin || $this === self::Accountant;
    }

    /**
     * All selectable roles.
     *
     * @return array<string, string>
     */
    public static function options(): array
    {
        return collect(self::cases())
            ->mapWithKeys(fn (self $role) => [$role->value => $role->label()])
            ->all();
    }
}
