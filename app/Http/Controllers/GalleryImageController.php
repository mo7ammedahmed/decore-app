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

    public function __construct(private readonly GalleryImageService $images)
    {
    }

    public function store(StoreGalleryImageRequest $request, GallerySection $section): RedirectResponse
    {
        $this->authorize('update', $section);

        $image = $this->images->store(
            $request->file('image'),
            $section,
            $request->input('alt_text'),
            $request->boolean('is_visible', true),
            (int) $request->input('sort_order', 0),
        );

        AuditService::log('gallery_image.uploaded', $image, null, [
            'path' => $image->path,
        ], $request->user()->id);

        return back()->with('success', 'Image uploaded.');
    }

    public function replace(StoreGalleryImageRequest $request, GalleryImage $image): RedirectResponse
    {
        $this->authorize('update', $image->section);

        $this->images->replace($request->file('image'), $image);

        AuditService::log('gallery_image.replaced', $image, ['replaced' => true], [
            'path' => $image->path,
        ], $request->user()->id);

        return back()->with('success', 'Image replaced.');
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

        return back()->with('success', 'Image updated.');
    }
}
