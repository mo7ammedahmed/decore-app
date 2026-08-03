<?php

namespace App\Services;

use App\Models\GalleryImage;
use App\Models\GallerySection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

/**
 * Stores and replaces portfolio (gallery) images on the configured default
 * disk — S3 in production, public locally. One file per gallery image row.
 */
class GalleryImageService
{
    /**
     * Store a new image under a gallery section and persist its metadata.
     */
    public function store(
        UploadedFile $file,
        GallerySection $section,
        ?string $altText = null,
        bool $isVisible = true,
        int $sortOrder = 0,
    ): GalleryImage {
        $disk = (string) config('filesystems.default', 'public');

        $path = $file->store('gallery/'.$section->id, $disk);

        if ($path === false) {
            throw new \RuntimeException(__('errors.gallery_image_store_failed'));
        }

        return GalleryImage::query()->create([
            'section_id' => $section->id,
            'disk' => $disk,
            'path' => $path,
            'original_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
            'alt_text' => $altText,
            'is_visible' => $isVisible,
            'sort_order' => $sortOrder,
        ]);
    }

    /**
     * Replace an existing image file, deleting the previous one first so a
     * failed store never leaves the gallery row pointing at a missing file.
     */
    public function replace(UploadedFile $file, GalleryImage $image): GalleryImage
    {
        $disk = (string) config('filesystems.default', 'public');
        $previousDisk = $image->disk;
        $previousPath = $image->path;

        $path = $file->store('gallery/'.$image->section_id, $disk);

        if ($path === false) {
            throw new \RuntimeException(__('errors.gallery_image_replace_failed'));
        }

        $image->forceFill([
            'disk' => $disk,
            'path' => $path,
            'original_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
        ])->save();

        // The default may change between uploads (for example, local storage
        // during setup and S3 in production). Delete from the recorded disk.
        Storage::disk($previousDisk)->delete($previousPath);

        return $image;
    }
}
