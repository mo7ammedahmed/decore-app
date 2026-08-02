<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreMaterialImageRequest;
use App\Models\Material;
use App\Services\AuditService;
use App\Services\ImageUploadService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;

class MaterialImageController extends Controller
{
    use AuthorizesRequests;

    public function __construct(private readonly ImageUploadService $images) {}

    public function store(StoreMaterialImageRequest $request, Material $material): RedirectResponse
    {
        $this->authorize('manageImage', $material);

        try {
            $this->images->store($request->file('image'), $material, $request->input('alt_text'));
        } catch (\RuntimeException) {
            return back()->with('error', 'material.image_store_failed');
        }

        AuditService::log('material.image_uploaded', $material, null, [
            'path' => $material->image_path,
        ]);

        return redirect()
            ->route('materials.show', $material)
            ->with('success', 'material.image_uploaded');
    }

    /**
     * Replace the existing product image (or store the first one).
     */
    public function update(StoreMaterialImageRequest $request, Material $material): RedirectResponse
    {
        $this->authorize('manageImage', $material);

        try {
            $this->images->store($request->file('image'), $material, $request->input('alt_text'));
        } catch (\RuntimeException) {
            return back()->with('error', 'material.image_store_failed');
        }

        AuditService::log('material.image_replaced', $material, ['replaced' => true], [
            'path' => $material->image_path,
        ]);

        return redirect()
            ->route('materials.show', $material)
            ->with('success', 'material.image_replaced');
    }

    public function destroy(Material $material): RedirectResponse
    {
        $this->authorize('manageImage', $material);

        if ($material->image_path === null) {
            return back()->with('error', 'material.image_none_to_remove');
        }

        // Capture the path before the service clears the row, so the audit
        // trail records which file was removed.
        $removedPath = $material->image_path;

        $this->images->delete($material);

        AuditService::log('material.image_deleted', $material, ['path' => $removedPath], null);

        return back()->with('success', 'material.image_removed');
    }
}
