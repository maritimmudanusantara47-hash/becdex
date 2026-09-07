<?php

namespace Tests\Feature\Notification;

use App\Models\User;
use Tests\TestCase;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Str;

class NotificationTest extends TestCase
{
    // ─── B-F11-01 ─────────────────────────────────────────────────────────────

    /** @test */
    public function it_returns_notifications_belonging_to_authenticated_user()
    {
        $user = $this->actingAsCompany();

        // Manually insert a notification for this user
        DatabaseNotification::create([
            'id'              => Str::uuid(),
            'type'            => 'App\Notifications\SubmissionStatusChanged',
            'notifiable_type' => User::class,
            'notifiable_id'   => $user->id,
            'data'            => json_encode([
                'title'   => 'Submission Disetujui',
                'message' => 'Submission Anda telah disetujui oleh admin.',
            ]),
            'read_at'         => null,
        ]);

        $response = $this->getJson('/api/notifications');

        $response->assertStatus(200)
            ->assertJsonStructure(['data', 'unread_count'])
            ->assertJsonPath('unread_count', 1);

        $this->assertCount(1, $response->json('data'));
    }

    /** @test */
    public function it_returns_empty_list_when_user_has_no_notifications()
    {
        $this->actingAsCompany();

        $response = $this->getJson('/api/notifications');

        $response->assertStatus(200)
            ->assertJsonPath('unread_count', 0);

        $this->assertCount(0, $response->json('data'));
    }

    /** @test */
    public function it_does_not_return_notifications_belonging_to_another_user()
    {
        $userA = $this->actingAsCompany();
        $userB = User::factory()->company()->create();

        // Notifikasi untuk userB
        DatabaseNotification::create([
            'id'              => Str::uuid(),
            'type'            => 'App\Notifications\SubmissionStatusChanged',
            'notifiable_type' => User::class,
            'notifiable_id'   => $userB->id,
            'data'            => json_encode(['message' => 'for userB']),
            'read_at'         => null,
        ]);

        $response = $this->getJson('/api/notifications');

        $response->assertStatus(200)
            ->assertJsonPath('unread_count', 0);
        $this->assertCount(0, $response->json('data'));
    }

    // ─── B-F11-02 ─────────────────────────────────────────────────────────────

    /** @test */
    public function it_marks_a_specific_notification_as_read()
    {
        $user = $this->actingAsCompany();

        $notifId = Str::uuid()->toString();
        DatabaseNotification::create([
            'id'              => $notifId,
            'type'            => 'App\Notifications\SubmissionStatusChanged',
            'notifiable_type' => User::class,
            'notifiable_id'   => $user->id,
            'data'            => json_encode(['message' => 'Test notif']),
            'read_at'         => null,
        ]);

        $response = $this->postJson('/api/notifications/mark-read', [
            'id' => $notifId,
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('notifications', [
            'id'     => $notifId,
        ]);

        // Pastikan read_at sudah diisi
        $notif = DatabaseNotification::find($notifId);
        $this->assertNotNull($notif->read_at, 'Notifikasi harus sudah ditandai sebagai dibaca.');
    }

    /** @test */
    public function it_marks_all_notifications_as_read_when_no_id_provided()
    {
        $user = $this->actingAsCompany();

        // Buat 3 notifikasi unread
        for ($i = 0; $i < 3; $i++) {
            DatabaseNotification::create([
                'id'              => Str::uuid(),
                'type'            => 'App\Notifications\SubmissionStatusChanged',
                'notifiable_type' => User::class,
                'notifiable_id'   => $user->id,
                'data'            => json_encode(['message' => "Notif {$i}"]),
                'read_at'         => null,
            ]);
        }

        $response = $this->postJson('/api/notifications/mark-read');

        $response->assertStatus(200);

        // Semua harus sudah read
        $unreadCount = $user->unreadNotifications()->count();
        $this->assertEquals(0, $unreadCount, 'Semua notifikasi harus sudah dibaca.');
    }
}
