<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreGalleryImageRequest;
use App\Http\Requests\UpdateGalleryImageRequest;
use App\Models\GalleryImage;
use App\Models\GallerySection;
use App\Services\AuditService;
use App\Services\GalleryImageService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;

class GalleryImageController extends Controller
{
    use AuthorizesRequests;

    public function __construct(private readonly GalleryImageService $images) {}

    public function store(StoreGalleryImageRequest $request, GallerySection $section): RedirectResponse
    {
        $this->authorize('update', $section);

        $files = $request->file('images') ?? collect([$request->file('image')])->filter()->all();

        // Explicit sort_order wins; otherwise append after the current max so
        // new uploads never collide with existing image ordering. `?? -1` keeps
        // the first batch starting at 0 on a fresh section (max() is null).
        $baseSort = $request->has('sort_order')
            ? (int) $request->input('sort_order')
            : ((int) ($section->images()->max('sort_order') ?? -1)) + 1;
        $count = 0;

        try {
            foreach ($files as $index => $file) {
                $image = $this->images->store(
                    $file,
                    $section,
                    $request->input('alt_text'),
                    $request->boolean('is_visible', true),
                    $baseSort + $index,
                );

                AuditService::log('gallery_image.uploaded', $image, null, [
                    'path' => $image->path,
                ], $request->user()->id);

                $count++;
            }
        } catch (\RuntimeException) {
            return back()->with('error', 'gallery.image_store_failed');
        }

        return back()->with('success', $count === 1 ? 'gallery.image_uploaded' : 'gallery.images_uploaded');
    }

    public function replace(StoreGalleryImageRequest $request, GalleryImage $image): RedirectResponse
    {
        $this->authorize('update', $image->section);

        try {
            $this->images->replace($request->file('image'), $image);
        } catch (\RuntimeException) {
            return back()->with('error', 'gallery.image_store_failed');
        }

        AuditService::log('gallery_image.replaced', $image, ['replaced' => true], [
            'path' => $image->path,
        ], $request->user()->id);

        return back()->with('success', 'gallery.image_replaced');
    }

    public function update(UpdateGalleryImageRequest $request, GalleryImage $image): RedirectResponse
    {
        $this->authorize('update', $image->section);

        $old = [
            'alt_text' => $image->alt_text,
            'is_visible' => $image->is_visible,
            'sort_order' => $image->sort_order,
        ];

        $image->forceFill([
            'alt_text' => $request->input('alt_text'),
            'is_visible' => $request->boolean('is_visible', $image->is_visible),
            'sort_order' => (int) $request->input('sort_order', $image->sort_order),
        ])->save();

        AuditService::log('gallery_image.updated', $image, $old, [
            'alt_text' => $image->alt_text,
            'is_visible' => $image->is_visible,
            'sort_order' => $image->sort_order,
        ], $request->user()->id);

        return back()->with('success', 'gallery.image_updated');
    }
}
