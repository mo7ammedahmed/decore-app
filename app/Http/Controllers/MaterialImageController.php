<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreMaterialImageRequest;
use App\Models\Material;
use App\Services\AuditService;
use App\Services\ImageUploadService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class MaterialImageController extends Controller
{
    use AuthorizesRequests;

    public function __construct(private readonly ImageUploadService $images)
    {
    }

    public function store(StoreMaterialImageRequest $request, Material $material): RedirectResponse
    {
        $this->authorize('manageImage', $material);

        $this->images->store($request->file('image'), $material, $request->input('alt_text'));

        AuditService::log('material.image_uploaded', $material, null, [
            'path' => $material->image_path,
        ]);

        return redirect()
            ->route('materials.show', $material)
            ->with('success', 'Image uploaded successfully.');
    }

    /**
     * Replace the existing product image (or store the first one).
     */
    public function update(StoreMaterialImageRequest $request, Material $material): RedirectResponse
    {
        $this->authorize('manageImage', $material);

        $this->images->store($request->file('image'), $material, $request->input('alt_text'));

        AuditService::log('material.image_replaced', $material, ['replaced' => true], [
            'path' => $material->image_path,
        ]);

        return redirect()
            ->route('materials.show', $material)
            ->with('success', 'Image replaced successfully.');
    }

    public function destroy(Material $material): RedirectResponse
    {
        $this->authorize('manageImage', $material);

        if ($material->image_path === null) {
            return back()->with('error', 'This material has no image to remove.');
        }

        // Capture the path before the service clears the row, so the audit
        // trail records which file was removed.
        $removedPath = $material->image_path;

        $this->images->delete($material);

        AuditService::log('material.image_deleted', $material, ['path' => $removedPath], null);

        return back()->with('success', 'Image removed successfully.');
    }
}
