<?php

namespace Tests\Feature\Admin;

use App\Models\Aspect;
use App\Models\Outcome;
use App\Models\Principle;
use App\Models\Indicator;
use Tests\TestCase;

class FrameworkAdminTest extends TestCase
{
    // ─── B-F9-01 ──────────────────────────────────────────────────────────────

    /** @test */
    public function admin_can_create_an_aspect()
    {
        $this->actingAsAdmin();

        $response = $this->postJson('/api/admin/framework/aspects', [
            'name' => 'Environmental Aspect Test',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('aspects', ['name' => 'Environmental Aspect Test']);
    }

    /** @test */
    public function admin_can_list_aspects()
    {
        $this->actingAsAdmin();
        Aspect::factory()->count(3)->create();

        $response = $this->getJson('/api/admin/framework/aspects');

        $response->assertStatus(200)
            ->assertJsonStructure(['data']);
    }

    /** @test */
    public function admin_can_update_an_aspect()
    {
        $this->actingAsAdmin();
        $aspect = Aspect::factory()->create();

        $response = $this->putJson("/api/admin/framework/aspects/{$aspect->id}", [
            'name' => 'Updated Aspect Name',
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('aspects', [
            'id'   => $aspect->id,
            'name' => 'Updated Aspect Name',
        ]);
    }

    /** @test */
    public function admin_can_delete_an_aspect()
    {
        $this->actingAsAdmin();
        $aspect = Aspect::factory()->create();

        $response = $this->deleteJson("/api/admin/framework/aspects/{$aspect->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('aspects', ['id' => $aspect->id]);
    }

    /** @test */
    public function admin_cannot_create_aspect_with_duplicate_name()
    {
        $this->actingAsAdmin();
        Aspect::factory()->create(['name' => 'Duplicate Aspect']);

        $response = $this->postJson('/api/admin/framework/aspects', [
            'name' => 'Duplicate Aspect',
        ]);

        $response->assertStatus(422);
    }

    // ─── B-F9-02 ──────────────────────────────────────────────────────────────

    /** @test */
    public function admin_can_create_an_indicator_with_valid_principle()
    {
        $this->actingAsAdmin();
        $aspect    = Aspect::factory()->create();
        $outcome   = Outcome::factory()->create(['aspect_id' => $aspect->id]);
        $principle = Principle::factory()->create(['outcome_id' => $outcome->id]);

        $response = $this->postJson('/api/admin/framework/indicators', [
            'name'         => 'Test Indicator',
            'principle_id' => $principle->id,
            'sort_order'   => 1,
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('indicators', ['name' => 'Test Indicator']);
    }

    /** @test */
    public function admin_cannot_create_indicator_with_invalid_principle_id()
    {
        $this->actingAsAdmin();

        $response = $this->postJson('/api/admin/framework/indicators', [
            'name'         => 'Invalid Indicator',
            'principle_id' => 99999, // non-existent
            'sort_order'   => 1,
        ]);

        $response->assertStatus(422);
    }
}
