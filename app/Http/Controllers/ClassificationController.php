<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreClassificationRequest;
use App\Http\Requests\UpdateClassificationRequest;
use App\Models\Classification;
use App\Models\Material;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ClassificationController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Classification::class);

        $classifications = Classification::query()
            ->when($request->query('search'), fn ($q, $search) => $q
                ->where('name_en', 'like', "%{$search}%")
                ->orWhere('name_ar', 'like', "%{$search}%"))
            ->withCount('materials')
            ->orderBy('sort_order')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Classifications/Index', [
            'classifications' => $classifications,
            'filters' => ['search' => $request->query('search')],
            'canManage' => $request->user()->isAdmin(),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Classification::class);

        return Inertia::render('Classifications/Create');
    }

    public function store(StoreClassificationRequest $request): RedirectResponse
    {
        $this->authorize('store', Classification::class);

        $data = $request->validated();
        $data['slug'] = $data['slug'] ?? Str::slug($data['name_en']);

        $classification = Classification::create($data);

        return redirect()
            ->route('classifications.edit', $classification)
            ->with('success', 'Classification created successfully.');
    }

    public function edit(Classification $classification): Response
    {
        $this->authorize('update', $classification);

        return Inertia::render('Classifications/Edit', [
            'classification' => $classification,
        ]);
    }

    public function update(UpdateClassificationRequest $request, Classification $classification): RedirectResponse
    {
        $this->authorize('update', $classification);

        $data = $request->validated();
        $data['slug'] = $data['slug'] ?? Str::slug($data['name_en']);

        $classification->update($data);

        return redirect()
            ->route('classifications.edit', $classification)
            ->with('success', 'Classification updated successfully.');
    }

    public function destroy(Classification $classification): RedirectResponse
    {
        $this->authorize('delete', $classification);

        if (Material::query()->where('classification_id', $classification->id)->exists()) {
            return back()->with('error', 'This classification cannot be deleted because it still has materials.');
        }

        $classification->delete();

        return redirect()
            ->route('classifications.index')
            ->with('success', 'Classification archived.');
    }
}
