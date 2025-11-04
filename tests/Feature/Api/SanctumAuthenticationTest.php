<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SanctumAuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_ping_endpoint_is_accessible_without_authentication(): void
    {
        $this->getJson('/api/ping')->assertOk();
    }

    public function test_protected_endpoint_requires_authentication(): void
    {
        $this->getJson('/api/ping-auth')->assertUnauthorized();
    }

    public function test_cookie_authenticated_request_can_access_protected_endpoint(): void
    {
        $user = User::factory()->create();

        Sanctum::actingAs($user, abilities: ['*'], guard: 'web');

        $this->getJson('/api/ping-auth')
            ->assertOk()
            ->assertJson([
                'ok' => true,
                'auth' => true,
            ]);
    }

    public function test_token_authenticated_request_can_access_protected_endpoint(): void
    {
        $user = User::factory()->create();

        $token = $user->createToken('test-token')->plainTextToken;

        $this->withToken($token)
            ->getJson('/api/user')
            ->assertOk()
            ->assertJsonFragment([
                'email' => $user->email,
            ]);
    }
}
