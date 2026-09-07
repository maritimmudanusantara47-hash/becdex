<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            BecdexLookupSeeder::class,
            AssessmentFrameworkSeeder::class,
            IndicatorAuditDataSeeder::class,
            AdminUserSeeder::class,
            DemoCompanySeeder::class,
            CmsContentSeeder::class,
        ]);


    }
}
