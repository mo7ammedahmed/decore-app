<?php

namespace Tests\Feature;

use App\Models\Material;
use App\Models\Supplier;
use App\Models\User;
use App\Services\ImageUploadService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class MaterialImageTest extends TestCase
{
    use RefreshDatabase;

    private ImageUploadService $service;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');
        config(['filesystems.default' => 'public']);
        $this->service = app(ImageUploadService::class);
    }

    private function material(): Material
    {
        return Material::factory()->create();
    }

    private function image(string $name = 'product.png'): UploadedFile
    {
        return UploadedFile::fake()->image($name, 100, 100);
    }

    public function test_store_sets_image_on_material_and_stores_file(): void
    {
        $material = $this->material();

        $this->service->store($this->image(), $material, 'Walnut veneer');

        $this->assertNotNull($material->image_path);
        $this->assertSame('Walnut veneer', $material->image_alt_text);
        Storage::disk('public')->assertExists($material->image_path);
        $this->assertNotNull($material->image_url);
    }

    public function test_one_image_per_material_is_enforced(): void
    {
        $material = $this->material();

        $this->service->store($this->image('first.png'), $material);
        $firstPath = $material->image_path;

        $this->service->store($this->image('second.png'), $material);

        // Replacing overwrites the single stored file rather than accumulating.
        Storage::disk('public')->assertMissing($firstPath);
        Storage::disk('public')->assertExists($material->image_path);
        $this->assertNotSame($firstPath, $material->image_path);
    }

    public function test_force_deleting_a_material_removes_its_image_file(): void
    {
        $material = $this->material();
        $this->service->store($this->image(), $material);
        $path = $material->image_path;

        $material->forceDelete();

        Storage::disk('public')->assertMissing($path);
    }

    public function test_replacing_image_deletes_the_previous_file(): void
    {
        $material = $this->material();
        $this->service->store($this->image('first.png'), $material);
        // Capture the path before the replacement — the returned model is the
        // same in-memory instance and would be mutated by the second store.
        $firstPath = $material->image_path;

        $this->service->store($this->image('second.png'), $material);

        Storage::disk('public')->assertMissing($firstPath);
        Storage::disk('public')->assertExists($material->image_path);
        $this->assertNotSame($firstPath, $material->image_path);
    }

    public function test_delete_removes_file_and_clears_the_row(): void
    {
        $material = $this->material();
        $this->service->store($this->image(), $material);
        $path = $material->image_path;

        $this->service->delete($material);

        Storage::disk('public')->assertMissing($path);
        $this->assertNull($material->fresh()->image_path);
        $this->assertNull($material->fresh()->image_url);
    }

    public function test_admin_can_upload_image_via_http(): void
    {
        $admin = User::factory()->admin()->create();
        $material = $this->material();

        $this->actingAs($admin)
            ->post("/materials/{$material->id}/image", [
                'image' => $this->image(),
                'alt_text' => 'Catalogue shot',
            ])
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertNotNull($material->fresh()->image_path);
        $this->assertDatabaseHas('audit_logs', ['action' => 'material.image_uploaded']);
    }

    public function test_supplier_cannot_upload_image_for_another_suppliers_material(): void
    {
        $supplierA = Supplier::factory()->create();
        $supplierB = Supplier::factory()->create();
        $materialB = Material::factory()->create(['supplier_id' => $supplierB->id]);

        $user = User::factory()->supplier($supplierA)->create();

        $this->actingAs($user)
            ->post("/materials/{$materialB->id}/image", [
                'image' => $this->image(),
            ])
            ->assertForbidden();
    }

    public function test_supplier_can_manage_their_own_materials_image(): void
    {
        $supplier = Supplier::factory()->create();
        $material = Material::factory()->create(['supplier_id' => $supplier->id]);

        $user = User::factory()->supplier($supplier)->create();

        $this->actingAs($user)
            ->post("/materials/{$material->id}/image", [
                'image' => $this->image(),
            ])
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertNotNull($material->fresh()->image_path);
    }

    public function test_image_url_is_serialized_in_material_payloads(): void
    {
        $material = $this->material();
        $this->service->store($this->image(), $material);

        $payload = $material->toArray();

        $this->assertSame($material->image_path, $payload['image_path']);
        $this->assertNotNull($payload['image_url']);
    }
}
