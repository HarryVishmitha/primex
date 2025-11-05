<?php

namespace Database\Seeders\Patches;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FixJsonNulls extends Seeder
{
    public function run(): void
    {
        DB::table('class_schedules')
            ->where('recurrence', '=', 'null')
            ->update(['recurrence' => DB::raw('NULL')]);
    }
}

