<?php

declare(strict_types=1);

namespace App\ValueObjects;

use InvalidArgumentException;

final class Money
{
    public function __construct(
        public readonly int $amount,
        public readonly string $currency = 'LKR',
    ) {
        if ($this->amount < 0) {
            throw new InvalidArgumentException('Money amount must be positive.');
        }
    }

    public static function from(int|string|self|null $value, string $currency = 'LKR'): ?self
    {
        if ($value === null) {
            return null;
        }

        if ($value instanceof self) {
            return $value;
        }

        return new self((int) $value, $currency);
    }

    public function toInteger(): int
    {
        return $this->amount;
    }

    public function format(): string
    {
        return sprintf('%s %s', $this->currency, number_format($this->amount / 100, 2));
    }
}

