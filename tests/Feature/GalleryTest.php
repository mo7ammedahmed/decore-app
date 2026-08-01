<?php

namespace Tests\Feature;

use App\Models\GallerySection;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class GalleryTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');
        config(['filesystems.default' => 'public']);
    }

    private function image(string $name = 'work.png'): UploadedFile
    {
        return UploadedFile::fake()->image($name, 400, 300);
    }

    public function test_admin_can_create_and_edit_section(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->post('/gallery-admin', [
                'name_en' => 'Wall Panels',
                'name_ar' => 'ألواح الجدران',
                'sort_order' => 10,
            ])
            ->assertRedirect()
            ->assertSessionHas('success');

        $section = GallerySection::query()->first();
        $this->assertSame('Wall Panels', $section->name_en);
        $this->assertSame('ألواح الجدران', $section->name_ar);

        $this->actingAs($admin)
            ->put("/gallery-admin/{$section->id}", [
                'name_en' => 'Panels',
                'name_ar' => 'الألواح',
                'is_visible' => false,
            ])
            ->assertRedirect();

        $section->refresh();
        $this->assertSame('Panels', $section->name_en);
        $this->assertFalse($section->is_visible);
    }

    public function test_section_name_is_required(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->post('/gallery-admin', ['name_en' => ''])
            ->assertSessionHasErrors('name_en');
    }

    public function test_only_admin_can_manage_gallery(): void
    {
        $sales = User::factory()->salesStaff()->create();

        $this->actingAs($sales)->get('/gallery-admin')->assertForbidden();
        $this->actingAs($sales)->post('/gallery-admin', ['name_en' => 'X'])->assertForbidden();
    }

    public function test_admin_can_upload_image_to_section(): void
    {
        $admin = User::factory()->admin()->create();
        $section = GallerySection::factory()->create();

        $this->actingAs($admin)
            ->post("/gallery-admin/{$section->id}/images", [
                'image' => $this->image(),
                'alt_text' => 'Walnut panels in situ',
            ])
            ->assertRedirect()
            ->assertSessionHas('success');

        $image = $section->images()->first();
        $this->assertNotNull($image);
        $this->assertSame('Walnut panels in situ', $image->alt_text);
        Storage::disk('public')->assertExists($image->path);
        $this->assertNotNull($image->image_url);
        $this->assertDatabaseHas('audit_logs', ['action' => 'gallery_image.uploaded']);
    }

    public function test_deleting_image_removes_stored_file(): void
    {
        $admin = User::factory()->admin()->create();
        $section = GallerySection::factory()->create();
        $this->actingAs($admin)->post("/gallery-admin/{$section->id}/images", ['image' => $this->image()]);

        $image = $section->images()->first();
        $path = $image->path;

        $this->actingAs($admin)
            ->delete("/gallery-admin/images/{$image->id}")
            ->assertRedirect();

        Storage::disk('public')->assertMissing($path);
        $this->assertDatabaseMissing('gallery_images', ['id' => $image->id]);
    }

    public function test_deleting_section_removes_its_images_and_files(): void
    {
        $admin = User::factory()->admin()->create();
        $section = GallerySection::factory()->create();
        $this->actingAs($admin)->post("/gallery-admin/{$section->id}/images", ['image' => $this->image('a.png')]);
        $this->actingAs($admin)->post("/gallery-admin/{$section->id}/images", ['image' => $this->image('b.png')]);

        $paths = $section->images()->pluck('path');

        $this->actingAs($admin)
            ->delete("/gallery-admin/{$section->id}")
            ->assertRedirect();

        foreach ($paths as $path) {
            Storage::disk('public')->assertMissing($path);
        }
        $this->assertDatabaseMissing('gallery_sections', ['id' => $section->id]);
        $this->assertSame(0, GallerySection::count());
    }

    public function test_non_image_upload_is_rejected(): void
    {
        $admin = User::factory()->admin()->create();
        $section = GallerySection::factory()->create();

        $this->actingAs($admin)
            ->post("/gallery-admin/{$section->id}/images", [
                'image' => UploadedFile::fake()->create('notes.txt', 10, 'text/plain'),
            ])
            ->assertSessionHasErrors('image');

        $this->assertSame(0, $section->images()->count());
    }

    public function test_public_gallery_shows_only_visible_sections_and_images(): void
    {
        $visible = GallerySection::factory()->create([
            'name_en' => 'Visible Section',
            'is_visible' => true,
            'sort_order' => 1,
        ]);
        GallerySection::factory()->create(['is_visible' => false, 'sort_order' => 2]);

        // Visible image on the visible section.
        $this->actingAs(User::factory()->admin()->create())
            ->post("/gallery-admin/{$visible->id}/images", ['image' => $this->image('shown.png')]);
        $visibleImage = $visible->images()->first();

        // A hidden image on the visible section is filtered out.
        $this->actingAs(User::factory()->admin()->create())
            ->post("/gallery-admin/{$visible->id}/images", ['image' => $this->image('hidden.png')]);
        $visible->images()->latest('id')->first()->update(['is_visible' => false]);

        $this->get('/gallery')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Public/Gallery')
                ->has('sections', 1)
                ->where('sections.0.name_en', 'Visible Section')
                ->has('sections.0.images', 1)
                ->where('sections.0.images.0.id', $visibleImage->id));
    }

    public function test_public_gallery_renders_empty_state_when_no_sections(): void
    {
        $this->get('/gallery')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Public/Gallery')
                ->has('sections', 0));
    }
}
