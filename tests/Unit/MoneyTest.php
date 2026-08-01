<?php

namespace Tests\Unit;

use App\Support\Money;
use PHPUnit\Framework\TestCase;

class MoneyTest extends TestCase
{
    public function test_round_uses_half_away_from_zero(): void
    {
        $this->assertSame('3', Money::round('2.5', 0));
        $this->assertSame('-3', Money::round('-2.5', 0));
        $this->assertSame('0.01', Money::round('0.005', 2));
        $this->assertSame('1.13', Money::round('1.125', 2));
        $this->assertSame('1.00', Money::round('1', 2));
    }

    public function test_add_and_sub_are_precise(): void
    {
        $this->assertSame('10.05', Money::add('10.00', '0.05'));
        $this->assertSame('9.99', Money::sub('10.00', '0.01'));
        $this->assertSame('0.00', Money::sub('1.00', '1.00'));
    }

    public function test_mul_and_div_are_precise(): void
    {
        $this->assertSame('3.30', Money::mul('1.10', '3'));
        $this->assertSame('2.50', Money::div('10.00', '4'));
        $this->assertSame('0.15', Money::div('15', '100'));
    }

    public function test_div_by_zero_returns_zero_not_error(): void
    {
        $this->assertSame('0.00', Money::div('5', '0'));
        $this->assertSame('0.00', Money::div('5', '0.00'));
    }

    public function test_comparisons(): void
    {
        $this->assertTrue(Money::gt('1.01', '1.00'));
        $this->assertTrue(Money::gte('1.00', '1.00'));
        $this->assertTrue(Money::lt('0.99', '1.00'));
        $this->assertFalse(Money::gt('1.00', '1.00'));
    }

    public function test_round_int(): void
    {
        $this->assertSame(3, Money::roundInt('2.6'));
        $this->assertSame(2, Money::roundInt('2.4'));
    }

    public function test_format_is_locale_friendly(): void
    {
        $this->assertSame('1,234.56', Money::format('1234.556'));
    }
}
