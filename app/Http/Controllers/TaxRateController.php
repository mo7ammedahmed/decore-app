<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTaxRateRequest;
use App\Http\Requests\UpdateTaxRateRequest;
use App\Models\TaxRate;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class TaxRateController extends Controller
{
    use AuthorizesRequests;
    public function index(): Response
    {
        $this->authorize('viewAny', TaxRate::class);

        return Inertia::render('Taxes/Index', [
            'taxRates' => TaxRate::query()->orderBy('rate', 'desc')->get(),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', TaxRate::class);

        return Inertia::render('Taxes/Create');
    }

    public function store(StoreTaxRateRequest $request): RedirectResponse
    {
        $this->authorize('store', TaxRate::class);

        $taxRate = DB::transaction(function () use ($request) {
            if ($request->boolean('is_default')) {
                TaxRate::query()->where('is_default', true)->update(['is_default' => false]);
            }

            return TaxRate::create($request->validated());
        });

        return redirect()
            ->route('taxes.edit', $taxRate)
            ->with('success', 'Tax rate created successfully.');
    }

    public function edit(TaxRate $taxRate): Response
    {
        $this->authorize('update', $taxRate);

        return Inertia::render('Taxes/Edit', ['taxRate' => $taxRate]);
    }

    public function update(UpdateTaxRateRequest $request, TaxRate $taxRate): RedirectResponse
    {
        $this->authorize('update', $taxRate);

        DB::transaction(function () use ($request, $taxRate): void {
            if ($request->boolean('is_default')) {
                TaxRate::query()->where('is_default', true)->whereKeyNot($taxRate->id)->update(['is_default' => false]);
            }

            $taxRate->update($request->validated());
        });

        return redirect()
            ->route('taxes.edit', $taxRate)
            ->with('success', 'Tax rate updated successfully.');
    }

    public function destroy(TaxRate $taxRate): RedirectResponse
    {
        $this->authorize('delete', $taxRate);

        if ($taxRate->is_default) {
            return back()->with('error', 'The default tax rate cannot be deleted.');
        }

        $taxRate->delete();

        return redirect()
            ->route('taxes.index')
            ->with('success', 'Tax rate deleted.');
    }
}