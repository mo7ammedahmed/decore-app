<?php

namespace App\Services;

use App\Models\Material;
use Illuminate\Http\UploadedFile;

class ImageUploadService
{
    /**
     * Store the product image on a material, deleting and replacing any
     * previous image file. One image per material, stored directly on the row.
     */
    public function store(UploadedFile $file, Material $material, ?string $altText = null): Material
    {
        $disk = (string) config('filesystems.default', 'public');

        $path = $file->store('materials/'.$material->id, $disk);

        if ($path === false) {
            throw new \RuntimeException('Unable to store the uploaded image.');
        }

        // Remove the previous stored file before overwriting the row, so a
        // failed store never leaves the material without its old image.
        $material->deleteStoredImage();

        $material->forceFill([
            'image_disk' => $disk,
            'image_path' => $path,
            'image_original_name' => $file->getClientOriginalName(),
            'image_mime_type' => $file->getMimeType(),
            'image_size' => $file->getSize(),
            'image_alt_text' => $altText,
        ])->save();

        return $material;
    }

    /**
     * Permanently remove the material's stored image file and clear the row.
     */
    public function delete(Material $material): void
    {
        $material->deleteStoredImage();

        $material->forceFill([
            'image_disk' => null,
            'image_path' => null,
            'image_original_name' => null,
            'image_mime_type' => null,
            'image_size' => null,
            'image_alt_text' => null,
        ])->save();
    }
}
