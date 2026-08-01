<?php

namespace Tests\Feature;

use App\Models\Classification;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ClassificationImageTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');
        config(['filesystems.default' => 'public']);
    }

    private function admin(): User
    {
        return User::factory()->admin()->create();
    }

    public function test_admin_can_upload_classification_cover(): void
    {
        $classification = Classification::factory()->create();

        $this->actingAs($this->admin())
            ->post("/classifications/{$classification->id}/image", [
                'image' => UploadedFile::fake()->image('wood.png', 1600, 1000),
                'alt_text' => 'Walnut wood-effect panels',
            ])
            ->assertRedirect(route('classifications.edit', $classification))
            ->assertSessionHas('success');

        $this->assertNotNull($classification->fresh()->image_path);
        $this->assertSame('Walnut wood-effect panels', $classification->fresh()->image_alt_text);
    }

    public function test_non_admin_cannot_upload_classification_cover(): void
    {
        $classification = Classification::factory()->create();
        $user = User::factory()->create(['role' => 'accountant']);

        $this->actingAs($user)
            ->post("/classifications/{$classification->id}/image", [
                'image' => UploadedFile::fake()->image('wood.png'),
            ])
            ->assertForbidden();
    }

    public function test_replacing_cover_deletes_the_previous_file(): void
    {
        $classification = Classification::factory()->create();

        $this->actingAs($this->admin())
            ->post("/classifications/{$classification->id}/image", [
                'image' => UploadedFile::fake()->image('first.png'),
            ]);

        $firstPath = $classification->fresh()->image_path;

        $this->actingAs($this->admin())
            ->put("/classifications/{$classification->id}/image", [
                'image' => UploadedFile::fake()->image('second.png'),
                'alt_text' => 'Replacement',
            ])
            ->assertRedirect(route('classifications.edit', $classification));

        Storage::disk('public')->assertMissing($firstPath);
        $this->assertSame('Replacement', $classification->fresh()->image_alt_text);
    }

    public function test_admin_can_remove_classification_cover(): void
    {
        $classification = Classification::factory()->create();

        $this->actingAs($this->admin())
            ->post("/classifications/{$classification->id}/image", [
                'image' => UploadedFile::fake()->image('wood.png'),
            ]);

        $path = $classification->fresh()->image_path;

        $this->actingAs($this->admin())
            ->delete("/classifications/{$classification->id}/image")
            ->assertSessionHas('success');

        Storage::disk('public')->assertMissing($path);
        $this->assertNull($classification->fresh()->image_path);
    }

    public function test_removing_a_missing_cover_returns_an_error(): void
    {
        $classification = Classification::factory()->create();

        $this->actingAs($this->admin())
            ->delete("/classifications/{$classification->id}/image")
            ->assertSessionHas('error');
    }
}
