<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreExchangeRateRequest;
use App\Models\Currency;
use App\Models\ExchangeRate;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ExchangeRateController extends Controller
{
    public function index(): Response
    {
        $this->authorize('viewAny', ExchangeRate::class);

        return Inertia::render('ExchangeRates/Index', [
            'rates' => ExchangeRate::query()
                ->with('baseCurrency:code,name', 'quoteCurrency:code,name')
                ->orderByDesc('effective_date')
                ->orderBy('quote_currency_code')
                ->paginate(20)
                ->withQueryString(),
            'currencies' => Currency::query()->active()->orderBy('code')->get(['code', 'name']),
        ]);
    }

    public function store(StoreExchangeRateRequest $request): RedirectResponse
    {
        $this->authorize('store', ExchangeRate::class);

        $data = $request->validated();

        ExchangeRate::updateOrCreate(
            [
                'base_currency_code' => $data['base_currency_code'],
                'quote_currency_code' => $data['quote_currency_code'],
                'effective_date' => $data['effective_date'],
            ],
            ['rate' => $data['rate']]
        );

        return redirect()
            ->route('exchange-rates.index')
            ->with('success', 'exchange_rate.saved');
    }

    public function destroy(ExchangeRate $exchangeRate): RedirectResponse
    {
        $this->authorize('delete', $exchangeRate);

        $exchangeRate->delete();

        return redirect()
            ->route('exchange-rates.index')
            ->with('success', 'exchange_rate.deleted');
    }
}
