<?php

namespace App\Services;

use App\Models\Classification;
use App\Models\Material;
use Illuminate\Http\UploadedFile;

class ImageUploadService
{
    /**
     * Store a single image on a model that carries image_* columns, deleting
     * and replacing any previous image file. Used for material product photos
     * and classification collection covers.
     */
    public function store(UploadedFile $file, Material|Classification $model, ?string $altText = null): Material|Classification
    {
        $disk = (string) config('filesystems.default', 'public');

        $path = $file->store($model->getTable().'/'.$model->id, $disk);

        if ($path === false) {
            throw new \RuntimeException(__('errors.image_store_failed'));
        }

        // Remove the previous stored file before overwriting the row, so a
        // failed store never leaves the model without its old image.
        $model->deleteStoredImage();

        $model->forceFill([
            'image_disk' => $disk,
            'image_path' => $path,
            'image_original_name' => $file->getClientOriginalName(),
            'image_mime_type' => $file->getMimeType(),
            'image_size' => $file->getSize(),
            'image_alt_text' => $altText,
        ])->save();

        return $model;
    }

    /**
     * Permanently remove the model's stored image file and clear the row.
     */
    public function delete(Material|Classification $model): void
    {
        $model->deleteStoredImage();

        $model->forceFill([
            'image_disk' => null,
            'image_path' => null,
            'image_original_name' => null,
            'image_mime_type' => null,
            'image_size' => null,
            'image_alt_text' => null,
        ])->save();
    }
}
