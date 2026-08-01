<?php

namespace Tests\Feature\Auth;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistrationRemovedTest extends TestCase
{
    use RefreshDatabase;

    public function test_register_screen_returns_not_found(): void
    {
        $this->get('/register')->assertNotFound();
    }

    public function test_register_post_returns_not_found_and_creates_no_user(): void
    {
        $response = $this->post('/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $response->assertNotFound();
        $this->assertDatabaseMissing('users', ['email' => 'test@example.com']);
    }

    public function test_only_admin_can_access_user_management(): void
    {
        $sales = User::factory()->salesStaff()->create();

        $this->actingAs($sales)
            ->get('/users')
            ->assertForbidden();

        $this->actingAs($sales)
            ->get('/users/create')
            ->assertForbidden();

        $this->actingAs($sales)
            ->post('/users', [
                'name' => 'Intruder',
                'email' => 'intruder@example.com',
                'password' => 'password',
                'password_confirmation' => 'password',
                'role' => UserRole::SalesStaff->value,
            ])
            ->assertForbidden();

        $this->assertDatabaseMissing('users', ['email' => 'intruder@example.com']);
    }

    public function test_admin_can_access_user_management(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->get('/users')
            ->assertOk();

        $this->actingAs($admin)
            ->get('/users/create')
            ->assertOk();
    }

    public function test_admin_can_create_users(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->post('/users', [
                'name' => 'New Staff',
                'email' => 'staff@example.com',
                'password' => 'password',
                'password_confirmation' => 'password',
                'role' => UserRole::SalesStaff->value,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('users', ['email' => 'staff@example.com']);
    }
}
