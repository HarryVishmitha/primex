<?php

declare(strict_types=1);

namespace App\Casts;

use App\ValueObjects\Money;
use Illuminate\Contracts\Database\Eloquent\CastsAttributes;
use Illuminate\Database\Eloquent\Model;
use InvalidArgumentException;

final class MoneyCast implements CastsAttributes
{
    public function __construct(private readonly string $currency = 'LKR')
    {
    }

    public function get(Model $model, string $key, mixed $value, array $attributes): ?Money
    {
        return Money::from($value, $this->currency);
    }

    public function set(Model $model, string $key, mixed $value, array $attributes): array
    {
        $money = Money::from($value, $this->currency);

        if ($money === null) {
            return [$key => null];
        }

        if (! $money instanceof Money) {
            throw new InvalidArgumentException('MoneyCast expects an integer amount or Money value object.');
        }

        return [$key => $money->toInteger()];
    }
}
