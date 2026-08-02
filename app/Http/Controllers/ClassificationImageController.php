<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreClassificationImageRequest;
use App\Models\Classification;
use App\Services\AuditService;
use App\Services\ImageUploadService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;

class ClassificationImageController extends Controller
{
    use AuthorizesRequests;

    public function __construct(private readonly ImageUploadService $images) {}

    public function store(StoreClassificationImageRequest $request, Classification $classification): RedirectResponse
    {
        $this->authorize('update', $classification);

        try {
            $this->images->store($request->file('image'), $classification, $request->input('alt_text'));
        } catch (\RuntimeException) {
            return back()->with('error', 'classification.image_store_failed');
        }

        AuditService::log('classification.image_uploaded', $classification, null, [
            'path' => $classification->image_path,
        ]);

        return redirect()
            ->route('classifications.edit', $classification)
            ->with('success', 'classification.image_uploaded');
    }

    /**
     * Replace the existing collection cover (or store the first one).
     */
    public function update(StoreClassificationImageRequest $request, Classification $classification): RedirectResponse
    {
        $this->authorize('update', $classification);

        try {
            $this->images->store($request->file('image'), $classification, $request->input('alt_text'));
        } catch (\RuntimeException) {
            return back()->with('error', 'classification.image_store_failed');
        }

        AuditService::log('classification.image_replaced', $classification, ['replaced' => true], [
            'path' => $classification->image_path,
        ]);

        return redirect()
            ->route('classifications.edit', $classification)
            ->with('success', 'classification.image_replaced');
    }

    public function destroy(Classification $classification): RedirectResponse
    {
        $this->authorize('update', $classification);

        if ($classification->image_path === null) {
            return back()->with('error', 'classification.image_none_to_remove');
        }

        // Capture the path before the service clears the row, so the audit
        // trail records which file was removed.
        $removedPath = $classification->image_path;

        $this->images->delete($classification);

        AuditService::log('classification.image_deleted', $classification, ['path' => $removedPath], null);

        return back()->with('success', 'classification.image_removed');
    }
}
