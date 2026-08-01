<?php

namespace App\Enums;

enum Unit: string
{
    case Piece = 'piece';
    case SquareMeter = 'square_meter';
    case Meter = 'meter';
    case Box = 'box';
    case Sheet = 'sheet';

    public function label(): string
    {
        return match ($this) {
            self::Piece => 'Piece',
            self::SquareMeter => 'm²',
            self::Meter => 'Meter',
            self::Box => 'Box',
            self::Sheet => 'Sheet',
        };
    }

    /**
     * @return array<string, string>
     */
    public static function options(): array
    {
        return collect(self::cases())
            ->mapWithKeys(fn (self $unit) => [$unit->value => $unit->label()])
            ->all();
    }
}
