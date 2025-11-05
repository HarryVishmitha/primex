<?php

declare(strict_types=1);

namespace App\MediaLibrary\PathGenerator;

use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Spatie\MediaLibrary\Support\PathGenerator\DefaultPathGenerator;

class TenantPathGenerator extends DefaultPathGenerator
{
    protected function getBasePath(Media $media): string
    {
        $prefix = config('media-library.prefix', '');

        $basePath = $prefix !== ''
            ? $prefix.'/'.$media->getKey()
            : (string) $media->getKey();

        $tenantKey = app()->bound('tenancy') && tenancy()->initialized
            ? tenant()->getTenantKey()
            : 'central';

        return 'tenants/'.$tenantKey.'/'.$basePath;
    }
}

