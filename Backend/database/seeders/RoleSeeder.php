<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use App\Models\Role;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            ['id' => 1,  'name' => 'admin'],
            ['id' => 2,  'name' => 'company'],
            ['id' => 6,  'name' => 'reviewer'],
            ['id' => 7,  'name' => 'supervisor'],
            ['id' => 10, 'name' => 'manager'],
            ['id' => 11, 'name' => 'qc_admin'],
            ['id' => 12, 'name' => 'it_manager'],
        ];
        foreach ($roles as $role) {
            Role::updateOrCreate(['id' => $role['id']], $role);
        }
    }
}
