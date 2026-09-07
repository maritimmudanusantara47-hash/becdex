<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@becdex.com'],
            [
                'name'              => 'BECdex Admin',
                'password'          => Hash::make('admin123'),
                'role_id'           => 1,
                'is_active'         => 1,
                'email_verified_at' => now(),
            ]
        );

        User::updateOrCreate(
            ['email' => 'admin@admin.com'],
            [
                'name'              => 'BECdex Admin',
                'password'          => Hash::make('admin123'),
                'role_id'           => 1,
                'is_active'         => 1,
                'email_verified_at' => now(),
            ]
        );

        // Assessment Admin / Auditor
        User::updateOrCreate(
            ['email' => 'auditor@becdex.com'],
            [
                'name'              => 'Auditor BECdex',
                'password'          => Hash::make('admin123'),
                'role_id'           => 6,
                'is_active'         => 1,
                'email_verified_at' => now(),
            ]
        );

        // Certificate Admin / Supervisor
        User::updateOrCreate(
            ['email' => 'certificator@becdex.com'],
            [
                'name'              => 'Certificate Manager',
                'password'          => Hash::make('admin123'),
                'role_id'           => 7,
                'is_active'         => 1,
                'email_verified_at' => now(),
            ]
        );

        // Finance Admin / Manager
        User::updateOrCreate(
            ['email' => 'finance@becdex.com'],
            [
                'name'              => 'Finance Manager',
                'password'          => Hash::make('admin123'),
                'role_id'           => 10,
                'is_active'         => 1,
                'email_verified_at' => now(),
            ]
        );

        // QC Admin
        User::updateOrCreate(
            ['email' => 'qc@becdex.com'],
            [
                'name'              => 'QC Manager',
                'password'          => Hash::make('admin123'),
                'role_id'           => 11,
                'is_active'         => 1,
                'email_verified_at' => now(),
            ]
        );


    }
}
