<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCurrencyRequest;
use App\Http\Requests\UpdateCurrencyRequest;
use App\Models\Currency;
use App\Services\CurrencyService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class CurrencyController extends Controller
{
    public function __construct(private readonly CurrencyService $currencies) {}

    public function index(): Response
    {
        $this->authorize('viewAny', Currency::class);

        return Inertia::render('Currencies/Index', [
            'currencies' => Currency::query()->withCount('exchangeRates')->orderBy('code')->get(),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Currency::class);

        return Inertia::render('Currencies/Create');
    }

    public function store(StoreCurrencyRequest $request): RedirectResponse
    {
        $this->authorize('store', Currency::class);

        $currency = Currency::create($request->validated());

        if ($request->boolean('is_base')) {
            $this->currencies->setBase($currency);
        }

        return redirect()
            ->route('currencies.index')
            ->with('success', 'currency.created');
    }

    public function edit(Currency $currency): Response
    {
        $this->authorize('update', $currency);

        return Inertia::render('Currencies/Edit', ['currency' => $currency]);
    }

    public function update(UpdateCurrencyRequest $request, Currency $currency): RedirectResponse
    {
        $this->authorize('update', $currency);

        $currency->update($request->validated());

        if ($request->boolean('is_base')) {
            $this->currencies->setBase($currency);
        }

        return redirect()
            ->route('currencies.index')
            ->with('success', 'currency.updated');
    }
}
