<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreGallerySectionRequest;
use App\Http\Requests\UpdateGallerySectionRequest;
use App\Models\GalleryImage;
use App\Models\GallerySection;
use App\Services\AuditService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class GallerySectionController extends Controller
{
    use AuthorizesRequests;

    public function index(): Response
    {
        $this->authorize('viewAny', GallerySection::class);

        $sections = GallerySection::query()
            ->withCount('images')
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        return Inertia::render('Gallery/Index', [
            'sections' => $sections,
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', GallerySection::class);

        return Inertia::render('Gallery/Form', [
            'section' => null,
        ]);
    }

    public function store(StoreGallerySectionRequest $request): RedirectResponse
    {
        $this->authorize('create', GallerySection::class);

        $section = GallerySection::query()->create($request->validated());

        AuditService::log('gallery_section.created', $section, null, [
            'name_en' => $section->name_en,
        ], $request->user()->id);

        return redirect()
            ->route('gallery.show', $section)
            ->with('success', 'gallery.section_created');
    }

    public function show(GallerySection $section): Response
    {
        $this->authorize('update', $section);

        $section->load('images');

        return Inertia::render('Gallery/Show', [
            'section' => $section,
        ]);
    }

    public function edit(GallerySection $section): Response
    {
        $this->authorize('update', $section);

        return Inertia::render('Gallery/Form', [
            'section' => $section,
        ]);
    }

    public function update(UpdateGallerySectionRequest $request, GallerySection $section): RedirectResponse
    {
        $this->authorize('update', $section);

        $section->update($request->validated());

        AuditService::log('gallery_section.updated', $section, null, [
            'name_en' => $section->name_en,
        ], $request->user()->id);

        return back()->with('success', 'gallery.section_updated');
    }

    /**
     * Remove the section together with its stored image files. Images are
     * deleted through Eloquent so each stored file is removed from the disk.
     */
    public function destroy(GallerySection $section): RedirectResponse
    {
        $this->authorize('delete', $section);

        // Delete the rows through Eloquent so each GalleryImage's `deleted`
        // hook runs and removes its stored file from the disk — atomically so
        // a failure never leaves a half-deleted section.
        DB::transaction(function () use ($section) {
            $section->images()->get()->each->delete();
            $section->delete();
        });

        AuditService::log('gallery_section.deleted', $section, null, null, request()->user()?->id);

        return redirect()
            ->route('gallery.index')
            ->with('success', 'gallery.section_deleted');
    }

    /**
     * Remove a single image row and its stored file.
     */
    public function destroyImage(GalleryImage $image): RedirectResponse
    {
        $this->authorize('update', $image->section);

        $image->delete();

        return back()->with('success', 'gallery.image_removed');
    }
}
