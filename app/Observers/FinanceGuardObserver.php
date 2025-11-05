<?php

declare(strict_types=1);

namespace App\Observers;

use Illuminate\Database\Eloquent\Model;
use RuntimeException;

class FinanceGuardObserver
{
    public function deleting(Model $model): bool
    {
        throw new RuntimeException(class_basename($model).' records cannot be deleted. Use status transitions instead.');
    }

    public function restoring(Model $model): bool
    {
        throw new RuntimeException(class_basename($model).' records do not support restoration.');
    }
}

